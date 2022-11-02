import { createFFmpeg, CreateFFmpegOptions, FFmpeg } from "@ffmpeg/ffmpeg";
import { fileTypeFromBuffer } from "file-type";

export default class FFMPEG {
    _FFMPEG: FFmpeg;

    constructor(option: CreateFFmpegOptions){
        this._FFMPEG = createFFmpeg(option);
    }

    async Load() {
        this._FFMPEG.load();
    }

    async GetFirstFrame(videoBuffer: Buffer) : Promise<Buffer> {
        const fileType = await fileTypeFromBuffer(videoBuffer);
        const fileName = 'video.' + fileType.ext;

        this._FFMPEG.FS('writeFile', fileName, videoBuffer);
        await this._FFMPEG.run('-i', fileName, '-vf', 'select=eq(n\\,0)', '-q:v', '3', 'image.jpg');
        return Buffer.from(this._FFMPEG.FS('readFile', 'image.jpg'));
    }

    async ConvertToMP4(videoBuffer: Buffer, isMP4?: boolean) : Promise<Buffer> {
        if (isMP4) return videoBuffer;
        
        const fileType = await fileTypeFromBuffer(videoBuffer);
        const fileName = 'video.' + fileType.ext;

        this._FFMPEG.FS('writeFile', fileName, videoBuffer);
        await this._FFMPEG.run('-i', fileName, 'output.mp4');
        return Buffer.from(this._FFMPEG.FS('readFile', 'output.mp4'));
    }
}