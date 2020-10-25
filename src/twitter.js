const AbortController = require('abort-controller');
const fetch = require('node-fetch');
const split = require('split');

const Credentials = require('./Credentials.js');
const TwitterError = require('./TwitterError.js');
const TwitterStream = require('./TwitterStream.js');

function applyParameters(url, parameters, prefix) {
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

class Twitter {
  constructor(args) {
    Object.defineProperty(this, 'credentials', {
      value: new Credentials(args),
      writable: false,
      enumerable: true,
    });
  }

  async get(endpoint, parameters) {
    const url = new URL(`https://api.twitter.com/2/${endpoint}`);
    applyParameters(url, parameters);

    const json = await fetch(url.toString(), {
      headers: {
        Authorization: await this.credentials.authorizationHeader(url),
      },
    }).then((response) => response.json());

    const error = TwitterError.fromJson(json);
    if (error) {
      throw error;
    }

    return json;
  }

  async post(endpoint, body, parameters) {
    const url = new URL(`https://api.twitter.com/2/${endpoint}`);
    applyParameters(url, parameters);

    const json = await fetch(url.toString(), {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        Authorization: await this.credentials.authorizationHeader(url),
      },
      body: JSON.stringify(body || {}),
    }).then((response) => response.json());

    const error = TwitterError.fromJson(json);
    if (error) {
      throw error;
    }

    return json;
  }

  stream(endpoint, parameters) {
    const abortController = new AbortController();

    return new TwitterStream(
      async () => {
        const url = new URL(`https://api.twitter.com/2/${endpoint}`);
        applyParameters(url, parameters);

        return fetch(url.toString(), {
          signal: abortController.signal,
          headers: {
            Authorization: await this.credentials.authorizationHeader(url),
          },
        });
      },
      () => {
        abortController.abort();
      }
    );
  }
}

module.exports = Twitter;
