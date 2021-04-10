import Credentials, { CredentialsArgs } from './Credentials';
import TwitterStream, { StreamOptions } from './TwitterStream';
export declare interface RequestParameters {
    [key: string]: string | Array<string> | RequestParameters;
}
export default class Twitter {
    credentials: Credentials;
    constructor(args: CredentialsArgs);
    get<T extends any>(endpoint: string, parameters?: RequestParameters): Promise<T>;
    post<T extends any>(endpoint: string, body: object, parameters?: RequestParameters): Promise<T>;
    delete<T extends any>(endpoint: string, parameters?: RequestParameters): Promise<T>;
    stream<T extends any>(endpoint: string, parameters?: RequestParameters, options?: StreamOptions): TwitterStream;
}
