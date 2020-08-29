const AbortController = require('abort-controller');
const fetch = require('node-fetch');
const split = require('split');

const Credentials = require('./Credentials.js');
const TwitterError = require('./TwitterError.js');
const TwitterStream = require('./TwitterStream.js');

async function cleanResponse(response) {
  const body = await response.json();

  if (body.status && body.status != 200) {
    throw new TwitterError(body.title, body.status, body.detail);
  }

  if (body.errors) {
    const error = body.errors[0];
    throw new TwitterError(
      `${body.title}: ${error.message}`,
      body.type,
      body.detail
    );
  }

  return body;
}

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

    return cleanResponse(
      await fetch(url.toString(), {
        headers: {
          Authorization: await this.credentials.authorizationHeader(url),
        },
      })
    );
  }

  async post(endpoint, body, parameters) {
    const url = new URL(`https://api.twitter.com/2/${endpoint}`);
    applyParameters(url, parameters);

    return cleanResponse(
      await fetch(url.toString(), {
        headers: {
          Authorization: await this.credentials.authorizationHeader(url),
        },
        body: JSON.stringify(body || {}),
      })
    );
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
