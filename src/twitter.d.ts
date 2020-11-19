declare module 'twitter-v2' {
  export interface ApplicationCredentials {
    consumer_key: string;
    consumer_secret: string;
    bearer_token?: string;
  }

  export interface UserCredentials {
    consumer_key: string;
    consumer_secret: string;
    access_token_key: string;
    access_token_secret: string;
  }

  export type CredentialsArgs = ApplicationCredentials | UserCredentials;

  export interface RequestParameters {
    [key: string]: any;
  }

  export interface TwitterResponse<T extends any> {
    data: T;
  }

  export class Credentials implements ApplicationCredentials, UserCredentials {
    constructor(args: CredentialsArgs);
    public consumer_key: string;
    public consumer_secret: string;
    public access_token_key: string;
    public access_token_secret: string;
    public bearer_token?: string;
    public appAuth(): boolean;
    public userAuth(): boolean;
    public createBearerToken(): Promise<string>;
    public authorizationHeader(url: string): Promise<string>;
  }

  export class TwitterStream<T> implements AsyncIterator<TwitterResponse<T>> {
    constructor(connect: () => Promise<any>, close: () => void);
    public close(): void;
    next(
      ...args: [] | [undefined]
    ): Promise<IteratorResult<TwitterResponse<T>>>;
    return?(value?: any): Promise<IteratorResult<TwitterResponse<T>, any>>;
    throw?(e?: any): Promise<IteratorResult<TwitterResponse<T>, any>>;
  }

  export default class Twitter {
    constructor(credentials: CredentialsArgs);
    public get<T>(
      endpoint: string,
      parameters?: RequestParameters
    ): Promise<TwitterResponse<T>>;
    public post<T>(
      endpoint: string,
      body?: any,
      parameters?: RequestParameters
    ): Promise<TwitterResponse<T>>;
    public stream<T>(
      endpoint: string,
      parameters?: RequestParameters
    ): TwitterStream<T>;
  }
}
