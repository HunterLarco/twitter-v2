declare module "twitter-v2" {
    export interface Credentials {
        consumer_key?: string;
        consumer_secret?: string;
        bearer_token?: string;
        access_token_key?: string;
        access_token_secret?: string;
    }

    export interface TwitterResponse<T extends any> {
        data: T;
    }

    export default class Twitter {
        constructor(credentials: Credentials);
        public get<T>(
            endpoint: string,
            parameters?: any
        ): Promise<TwitterResponse<T>>;
        public post<T>(
            endpoint: string,
            body?: any,
            parameters?: any
        ): Promise<TwitterResponse<T>>;
        public stream(endpoint: string, parameters?: any): any;
    }
}
