import AbortController from 'abort-controller';
import fetch from 'node-fetch';
import { URL } from 'url';

import Credentials, { CredentialsArgs } from './Credentials';
import TwitterError from './TwitterError.js';
import TwitterStream, { StreamOptions } from './TwitterStream';

export declare interface RequestParameters {
  [key: string]: string | Array<string> | RequestParameters;
}

function applyParameters(
  url: URL,
  parameters?: RequestParameters,
  prefix?: string
) {
  prefix = prefix || '';

  if (!parameters) {
    return;
  }

  for (const [key, value] of Object.entries(parameters)) {
    if (typeof value == 'object' && value instanceof Array) {
      url.searchParams.set(prefix + key, value.join(','));
    } else if (typeof value == 'object') {
      applyParameters(url, value, `${prefix}${key}.`);
    } else {
      url.searchParams.set(prefix + key, value);
    }
  }
}

export default class Twitter {
  public credentials: Credentials;

  constructor(args: CredentialsArgs) {
    this.credentials = new Credentials(args);
  }

  async get<T extends any>(
    endpoint: string,
    parameters?: RequestParameters
  ): Promise<T> {
    const url = new URL(`https://api.twitter.com/2/${endpoint}`);
    applyParameters(url, parameters);

    const json = await fetch(url.toString(), {
      headers: {
        Authorization: await this.credentials.authorizationHeader(url, {
          method: 'GET',
        }),
      },
    }).then((response) => response.json());

    const error = TwitterError.fromJson(json);
    if (error) {
      throw error;
    }

    return json;
  }

  async post<T extends any>(
    endpoint: string,
    body: object,
    parameters?: RequestParameters
  ): Promise<T> {
    const url = new URL(`https://api.twitter.com/2/${endpoint}`);
    applyParameters(url, parameters);

    const json = await fetch(url.toString(), {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        Authorization: await this.credentials.authorizationHeader(url, {
          method: 'POST',
          body: body,
        }),
      },
      body: JSON.stringify(body || {}),
    }).then((response) => response.json());

    const error = TwitterError.fromJson(json);
    if (error) {
      throw error;
    }

    return json;
  }

  async delete<T extends any>(
    endpoint: string,
    parameters?: RequestParameters
  ): Promise<T> {
    const url = new URL(`https://api.twitter.com/2/${endpoint}`);
    applyParameters(url, parameters);

    const json = await fetch(url.toString(), {
      method: 'delete',
      headers: {
        Authorization: await this.credentials.authorizationHeader(url, {
          method: 'DELETE',
        }),
      },
    }).then((response) => response.json());

    const error = TwitterError.fromJson(json);
    if (error) {
      throw error;
    }

    return json;
  }

  stream<T extends any>(
    endpoint: string,
    parameters?: RequestParameters,
    options?: StreamOptions
  ): TwitterStream {
    const abortController = new AbortController();

    return new TwitterStream(
      async () => {
        const url = new URL(`https://api.twitter.com/2/${endpoint}`);
        applyParameters(url, parameters);

        return fetch(url.toString(), {
          signal: abortController.signal,
          headers: {
            Authorization: await this.credentials.authorizationHeader(url, {
              method: 'GET',
            }),
          },
        });
      },
      () => {
        abortController.abort();
      },
      options || {}
    );
  }
}

module.exports = Twitter;
