import { Attachment } from 'discord.js';
import { MediaConfig } from '../Config.js';
import { Duplex } from 'stream';

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

    static BufferToStream(buffer: Buffer) : Duplex {
        let tmp = new Duplex();
        tmp.push(buffer);
        tmp.push(null);
        return tmp;
    }
}