import { Attachment } from 'discord.js';
import { MediaConfig } from '../Config.js';

interface IResponse {
    status: boolean;
    type: string;
}

export default class Media {
    static Validate(attachment: Attachment) : IResponse {
        return {
            status : (MediaConfig[attachment.contentType] !== undefined),
            type : MediaConfig[attachment.contentType]
        }
    }
}