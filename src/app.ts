import Instagram from './Utils/Instagram.js';
import { UploadType, IResponse } from './Utils/Instagram.js';
import * as dotenv from 'dotenv';
import { AttachmentBuilder, Client, Events, GatewayIntentBits, TextChannel, UserManager } from 'discord.js';
import Media from './Utils/Media.js';
import pkg from 'request-promise';
import Embed, { EmbedType } from './Utils/Embed.js';
import Jimp from 'jimp';
import FFMPEG from './Utils/FFMPEG.js';
import * as replit from './Utils/replit.js';
import {Caption} from './Config.js';

const {get: MediaGet} = pkg;
replit;
dotenv.config();

const InstagramClient = new Instagram(process.env.IG_USERNAME, process.env.IG_PASSWORD);

const DiscordClient = new Client({
    intents : [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
});

const FFMPEGClient = new FFMPEG({
    log: process.env.APP_ENV === 'development'
});

if (process.env.APP_ENV === 'development')
    DiscordClient
        .on(Events.Error, console.error)
        .on(Events.Debug, console.log)
        .on(Events.Warn, console.log);

console.log(`FIRST BOOT AT ${new Date().toLocaleString('en-US', { timeZone: process.env.TZ })}`);

(async () => {
    let LogChannel : TextChannel;
    
    // Log in to Discord with your client's token
    DiscordClient.login(process.env.DISCORD_TOKEN);

    DiscordClient.once(Events.ClientReady, async c => {
        console.log(`Ready! Logged in as ${c.user.tag}`);

        LogChannel = DiscordClient.channels.cache.get(process.env.LOG_CHANNEL_ID) as TextChannel;
        await LogChannel.send(Embed.Message(EmbedType.Success, "Discord Log", "Information", "Online!"));

        const loginResult = await InstagramClient.Login();
        if (loginResult.status){
            console.log("[ig] Login successfully");
            await LogChannel.send(Embed.Message(EmbedType.Success, "Instagram Log", "Information", "Logged in!"));
        } else {
            console.log("[ig] Login failed. Error message : " + loginResult.data.message);
            await LogChannel.send(Embed.Message(EmbedType.Error, "Instagram Log", loginResult.data.name, loginResult.data.message));
        }

        await FFMPEGClient.Load();
    });

    DiscordClient.on(Events.MessageCreate, async message => {
        try {
            if (message.author.bot)
                return;

            if (message.author.id == DiscordClient.user.id)
                return;
    
            if (message.guildId != process.env.GUILD_ID)
                return;
            
            if (message.channelId != process.env.SUBMIT_CHANNEL_ID)
                return;

            LogChannel = DiscordClient.channels.cache.get(process.env.LOG_CHANNEL_ID) as TextChannel;

            console.log("[dc] Got new attachment!");

            const _MediaArrayBufferPromise = [];
            const MediaArrayType = [];
            const MediaArrayMime = [];
            if (message.attachments.size > 0) {
                message.attachments.forEach(data => {
                    const ValidateData = Media.Validate(data);
                    
                    if (ValidateData.status){
                        const _buffer = MediaGet({
                            url: data.url,
                            encoding: null
                        });
                        _MediaArrayBufferPromise.push(_buffer);
                        MediaArrayType.push(ValidateData.type);
                        MediaArrayMime.push(data.contentType);
                    } else {
                        LogChannel.send(Embed.Message(EmbedType.Warning, "Discord Log", "MIME", "Unknown MIME type : " + data.contentType));
                        console.log("[dc] Unknown mime type : " + data.contentType);
                    }
                });
            }

            const _MediaArrayBufferPromiseSec = await Promise.all(_MediaArrayBufferPromise);

            if (_MediaArrayBufferPromiseSec.length > 0) {
                //Converting all media format into instagram needs
                const _MediaArrayBufferConvertedPromise = [];
                _MediaArrayBufferPromiseSec.forEach((val, idx) => {
                    if (MediaArrayType[idx] == 'PHOTO') {
                        console.log("[dc] Converting media [photo] ...");
                        const buff = Jimp.read(val).then(data => {
                            return data.getBufferAsync(Jimp.MIME_JPEG);
                        });
                        _MediaArrayBufferConvertedPromise.push(buff);
                    } else if (MediaArrayType[idx] == 'VIDEO') {
                        console.log("[dc] Converting media [video] ...");
                        const buff = FFMPEGClient.ConvertToMP4(val, MediaArrayMime[idx] == 'video/mp4');
                        _MediaArrayBufferConvertedPromise.push(buff);
                    }
                });
                const MediaArrayBuffer = await Promise.all(_MediaArrayBufferConvertedPromise);
                console.log("[dc] Media converted!");
                
                if (MediaArrayBuffer.length == 1) {
                    let uploadResult : IResponse;

                    switch (MediaArrayType[0]) {
                        case 'PHOTO':
                            console.log("[ig] Uploading photo...");
                            uploadResult = await InstagramClient.Upload(UploadType.PHOTO, {
                                file: MediaArrayBuffer[0],
                                caption: Caption
                            });
                            break;
                        
                        case 'VIDEO':
                            console.log("[ig] Uploading video...");
                            uploadResult = await InstagramClient.Upload(UploadType.VIDEO, {
                                video: MediaArrayBuffer[0],
                                coverImage: await FFMPEGClient.GetFirstFrame(MediaArrayBuffer[0]),
                                caption: Caption
                            });
                            break;

                        default:
                            break;
                    }

                    const attachmentExt = uploadResult.type == UploadType.PHOTO ? 'jpg' : uploadResult.type == UploadType.VIDEO ? 'mp4' : '';
                    const attachmentType = uploadResult.type == UploadType.PHOTO ? 'Photo' : uploadResult.type == UploadType.VIDEO ? 'Video' : '';

                    if (uploadResult.status){
                        console.log(`[ig] ${attachmentType} uploaded successfully`);
                        LogChannel.send(Embed.Message(EmbedType.Success, "Instagram Log", "Upload Status", `Post successfully posted. Submitted by <@${message.author.id}>`, [ new AttachmentBuilder(Media.BufferToStream(MediaArrayBuffer[0])).setName(`file.${attachmentExt}`) ] ));
                    } else {
                        console.log(`[ig] ${attachmentType} uploaded failed`);
                        LogChannel.send(Embed.Message(EmbedType.Error, "Instagram Log", uploadResult.data.name, uploadResult.data.message, [ new AttachmentBuilder(Media.BufferToStream(MediaArrayBuffer[0])).setName(`file.${attachmentExt}`) ] ));
                    }
                } else {
                    const AllMedia = [];
            
                    MediaArrayBuffer.forEach((val, idx) => {
                        if (MediaArrayType[idx] == "PHOTO")
                            AllMedia.push({
                                file : val
                            });
                        else if (MediaArrayType[idx] == "VIDEO")
                            AllMedia.push({
                                video : val
                            });
                    });
                }
            }

            
        } catch (error) {
            LogChannel.send(Embed.Message(EmbedType.Success, "Discord Log", "Error", error.message));
        }
    });
})();