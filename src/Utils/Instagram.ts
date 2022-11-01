import { 
    IgApiClient,

    PostingPhotoOptions, 
    PostingVideoOptions, 
    PostingAlbumOptions, 
    PostingStoryPhotoOptions, 
    PostingStoryVideoOptions
} from 'instagram-private-api';

interface IResponse {
    status: boolean;
    data: any;
}

export enum UploadType {
    PHOTO,
    VIDEO,
    ALBUM
}

export default class Instagram {
    Instagram: IgApiClient = new IgApiClient();
    isLoggedIn: boolean = false;

    constructor (public Username: string, public Password: string){
        this.Instagram.state.generateDevice(this.Username);
    }

    async Login() : Promise<IResponse> {
        const output = {} as IResponse;
        output.status = false;
        try {
            const loginResult = await this.Instagram.account.login(this.Username, this.Password);
            this.isLoggedIn = true;
            output.status = true;
            output.data = loginResult;
        } catch (error) {
            output.status = false;
            output.data = error;
        }
        return output;
    }

    async Logout() : Promise<IResponse>{
        const output = {} as IResponse;
        output.status = false;
        try {
            const logoutResult = await this.Instagram.account.logout();
            this.isLoggedIn = false;
            output.status = true;
            output.data = logoutResult;
        } catch (error) {
            output.status = false;
            output.data = error;
        }
        return output;
    }

    Status() : boolean {
        return this.isLoggedIn;
    }
    
    async Upload(type: UploadType, options: PostingAlbumOptions) : Promise<IResponse>;
    async Upload(type: UploadType, options: PostingPhotoOptions) : Promise<IResponse>;
    async Upload(type: UploadType, options: PostingVideoOptions) : Promise<IResponse>;
    async Upload(type: UploadType, options: PostingStoryPhotoOptions) : Promise<IResponse>;
    async Upload(type: UploadType, options: PostingStoryVideoOptions) : Promise<IResponse>;
    async Upload(type: UploadType, options: any) : Promise<IResponse> {
        const output = {} as IResponse;
        output.status = false;
        try {
            if (this.isLoggedIn){
                if (type == UploadType.ALBUM){          // Album upload
                    const result = await this.Instagram.publish.album(options);
                    output.status = true;
                    output.data = result;
                } else if (type == UploadType.PHOTO) {  // Photo upload
                    const result = await this.Instagram.publish.photo(options);
                    output.status = true;
                    output.data = result;
                } else if (type == UploadType.VIDEO) {  // Video upload
                    const result = await this.Instagram.publish.video(options);
                    output.status = true;
                    output.data = result;
                } else {
                    output.status = false;
                    output.data = "Invalid UploadType";
                }
            } else {
                output.status = false;
                output.data = "Login first.";
            }
        } catch (error) {
            output.status = false;
            output.data = error;
        }
        return output;
    }
}
