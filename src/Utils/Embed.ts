import { APIEmbed, MessageCreateOptions } from "discord.js";

export enum EmbedType {
    Error = 0xff0000,
    Success = 0x00ff00,
    Information = 0x00ffff,
    Warning = 0xffff00
}

export default class Embed {
    static Message(type: EmbedType, embed_title: string, embed_type: string, embed_message) : MessageCreateOptions {
        return {
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
        }
    }
}