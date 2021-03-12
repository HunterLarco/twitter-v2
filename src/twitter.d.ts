import { CredentialsArgs } from './Credentials';
import { TwitterStream } from './TwitterStream';

declare module 'twitter-v2' {
  export interface RequestParameters {
    [key: string]: string | Array<string> | RequestParameters;
  }

  export default class Twitter {
    constructor(credentials: CredentialsArgs);

    public get<T extends any>(
      endpoint: string,
      parameters?: RequestParameters
    ): Promise<T>;

    public post<T extends any>(
      endpoint: string,
      body?: any,
      parameters?: RequestParameters
    ): Promise<T>;

    public delete<T extends any>(
      endpoint: string,
      parameters?: RequestParameters
    ): Promise<T>;

    public stream<T extends any>(
      endpoint: string,
      parameters?: RequestParameters,
      options?: object
    ): TwitterStream<T>;
  }
}
