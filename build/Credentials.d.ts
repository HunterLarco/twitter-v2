/// <reference types="node" />
import { URL } from 'url';
declare interface ApplicationConsumerCredentials {
    consumer_key: string;
    consumer_secret: string;
}
declare interface ApplicationBearerCredentials {
    bearer_token: string;
}
declare interface ApplicationFullCredentials {
    consumer_key: string;
    consumer_secret: string;
    bearer_token: string;
}
declare interface UserCredentials {
    consumer_key: string;
    consumer_secret: string;
    access_token_key: string;
    access_token_secret: string;
}
export declare type CredentialsArgs = ApplicationConsumerCredentials | ApplicationBearerCredentials | ApplicationFullCredentials | UserCredentials;
export default class Credentials {
    private _consumer_key?;
    private _consumer_secret?;
    private _bearer_token?;
    private _access_token_key?;
    private _access_token_secret?;
    private _bearer_token_promise?;
    private _oauth?;
    constructor(args: CredentialsArgs);
    get consumer_key(): string | undefined;
    get consumer_secret(): string | undefined;
    get bearer_token(): string | undefined;
    get access_token_key(): string | undefined;
    get access_token_secret(): string | undefined;
    appAuth(): boolean;
    userAuth(): boolean;
    createBearerToken(): Promise<void>;
    authorizationHeader(url: URL, request: {
        method: string;
        body?: object;
    }): Promise<string>;
}
export {};
