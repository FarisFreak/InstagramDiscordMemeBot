import { APIEmbed, Message, MessageCreateOptions, ReplyOptions } from "discord.js";

export enum EmbedType {
    Error = 0xff0000,
    Success = 0x00ff00,
    Information = 0x00ffff,
    Warning = 0xffff00
}

export default class Embed {
    static Message(type: EmbedType, embed_title: string, embed_type: string, embed_message, message_reply?: Message) : MessageCreateOptions {
        const output = {
            tts: false,
            embeds: [
                <APIEmbed>{
                    type: "rich",
                    title: embed_title,
                    color: type,
                    fields: [
                        {
                            name: embed_type,
                            value: embed_message,
                            inline: true
                        }
                    ],
                    timestamp: `${new Date().toISOString()}`,
                    author: {
                        name: `[${new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().replace(/T/, ' ').replace(/\..+/, '')}]`
                    }
                }
            ]
        };

        if (message_reply != null)
            Object.assign(output, {
                reply: <ReplyOptions>{
                    messageReference: message_reply,
                    failIfNotExists: true
                },
            });

        return output;
    }
}