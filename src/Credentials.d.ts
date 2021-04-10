export interface ApplicationConsumerCredentials {
  consumer_key: string;
  consumer_secret: string;
}

export interface ApplicationBearerCredentials {
  bearer_token: string;
}

export interface ApplicationFullCredentials {
  consumer_key: string;
  consumer_secret: string;
  bearer_token: string;
}

export interface UserCredentials {
  consumer_key: string;
  consumer_secret: string;
  access_token_key: string;
  access_token_secret: string;
}

export type CredentialsArgs =
  | ApplicationConsumerCredentials
  | ApplicationBearerCredentials
  | ApplicationFullCredentials
  | UserCredentials;

export class Credentials {
  constructor(args: CredentialsArgs);

  public consumer_key: string;
  public consumer_secret: string;
  public access_token_key: string;
  public access_token_secret: string;
  public bearer_token?: string;

  public appAuth(): boolean;
  public userAuth(): boolean;

  public createBearerToken(): Promise<string>;

  public authorizationHeader(
    url: string,
    options: {
      method: string;
      body?: object;
    }
  ): Promise<string>;
}
