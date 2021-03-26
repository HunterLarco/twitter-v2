import { CredentialsArgs } from './Credentials';
import { StreamOptions, TwitterStream } from './TwitterStream';

declare module 'twitter-v2' {
  export interface RequestParameters {
    [key: string]: string | Array<string> | RequestParameters;
  }

  export interface StreamOptions {
    // Number of seconds to wait for data or a heartbeat ping from Twitter before
    // considering the stream closed (default value is 30 seconds).
    timeout: number | undefined;
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
      options?: StreamOptions
    ): TwitterStream<T>;
  }
}
