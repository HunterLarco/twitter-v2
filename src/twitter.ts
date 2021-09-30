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

function getUrlString(url: URL): string {
  // make sure spaces query parameters are encoded as %20 and not +
  // or else oauth signing fails since it uses decodeURIComponent and
  // encodeURIComponent https://github.com/ddo/oauth-1.0a/issues/111
  return url.toString().replace(/\+/g, '%20');
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

    const urlString = getUrlString(url);
    const json = await fetch(urlString, {
      headers: {
        Authorization: await this.credentials.authorizationHeader(urlString, {
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

    const urlString = getUrlString(url);
    const json = await fetch(urlString, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        Authorization: await this.credentials.authorizationHeader(urlString, {
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

    const urlString = getUrlString(url);
    const json = await fetch(urlString, {
      method: 'delete',
      headers: {
        Authorization: await this.credentials.authorizationHeader(urlString, {
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

        const urlString = getUrlString(url);
        return fetch(urlString, {
          signal: abortController.signal,
          headers: {
            Authorization: await this.credentials.authorizationHeader(
              urlString,
              {
                method: 'GET',
              }
            ),
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
