const OAuth = require('oauth-1.0a');
const crypto = require('crypto');
const fetch = require('node-fetch');

const TwitterError = require('./TwitterError.js');

function validate(credentials) {
  if (credentials.consumer_key && typeof credentials.consumer_key != 'string') {
    throw new Error(
      'Invalid value for consumer_key. Expected string but got ' +
        typeof credentials.consumer_key
    );
  }

  if (
    credentials.consumer_secret &&
    typeof credentials.consumer_secret != 'string'
  ) {
    throw new Error(
      'Invalid value for consumer_secret. Expected string but got ' +
        typeof credentials.consumer_secret
    );
  }

  if (credentials.bearer_token && typeof credentials.bearer_token != 'string') {
    throw new Error(
      'Invalid value for bearer_token. Expected string but got ' +
        typeof credentials.bearer_token
    );
  }

  if (
    credentials.access_token_key &&
    typeof credentials.access_token_key != 'string'
  ) {
    throw new Error(
      'Invalid value for access_token_key. Expected string but got ' +
        typeof credentials.access_token_key
    );
  }

  if (
    credentials.access_token_secret &&
    typeof credentials.access_token_secret != 'string'
  ) {
    throw new Error(
      'Invalid value for access_token_secret. Expected string but got ' +
        typeof credentials.access_token_secret
    );
  }

  if (!credentials.consumer_key) {
    throw new Error('Missing required argument: consumer_key');
  }

  if (!credentials.consumer_secret) {
    throw new Error('Missing required argument: consumer_secret');
  }

  if (!!credentials.access_token_key ^ !!credentials.access_token_secret) {
    throw new Error(
      'Invalid argument: access_token_key and access_token_secret must both be ' +
        'defined when using user authorization'
    );
  }

  if (
    (credentials.access_token_key || credentials.access_token_secret) &&
    credentials.bearer_token
  ) {
    throw new Error(
      'Invalid argument: access_token_key and access_token_secret should not ' +
        'be used with bearer_token'
    );
  }
}

async function createBearerToken({ consumer_key, consumer_secret }) {
  const response = await fetch('https://api.twitter.com/oauth2/token', {
    method: 'post',
    headers: {
      Authorization:
        'Basic ' +
        Buffer.from(`${consumer_key}:${consumer_secret}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
    body: 'grant_type=client_credentials',
  });

  const body = await response.json();

  if (body.errors) {
    const error = body.errors[0];
    throw new TwitterError(
      `${body.title}: ${error.message}`,
      body.type,
      body.detail
    );
  }

  if (body.token_type != 'bearer') {
    throw new TwitterError(
      'Unexpected reply from Twitter upon obtaining bearer token',
      undefined,
      `Expected "bearer" but found ${body.token_type}`
    );
  }

  return body.access_token;
}

module.exports = class Credentials {
  constructor(args) {
    const {
      consumer_key,
      consumer_secret,
      bearer_token,
      access_token_key,
      access_token_secret,
    } = args || {};

    this._consumer_key = consumer_key;
    this._consumer_secret = consumer_secret;
    this._bearer_token = bearer_token;
    this._access_token_key = access_token_key;
    this._access_token_secret = access_token_secret;

    this._bearer_token_promise = null;

    this._oauth = OAuth({
      consumer: {
        key: consumer_key,
        secret: consumer_secret,
      },
      signature_method: 'HMAC-SHA1',
      hash_function(base_string, key) {
        return crypto
          .createHmac('sha1', key)
          .update(base_string)
          .digest('base64');
      },
    });

    validate(this);
  }

  get consumer_key() {
    return this._consumer_key;
  }

  get consumer_secret() {
    return this._consumer_secret;
  }

  get bearer_token() {
    return this._bearer_token;
  }

  get access_token_key() {
    return this._access_token_key;
  }

  get access_token_secret() {
    return this._access_token_secret;
  }

  appAuth() {
    return !this.access_token_key && !this.access_token_secret;
  }

  userAuth() {
    return !this.appAuth();
  }

  async createBearerToken() {
    if (this.userAuth()) {
      throw new Error(
        'Refusing to create a bearer token when using user authentication'
      );
    }

    if (this.bearer_token) {
      return;
    }

    if (this._bearer_token_promise) {
      return this._bearer_token_promise;
    }

    this._bearer_token_promise = createBearerToken({
      consumer_key: this.consumer_key,
      consumer_secret: this.consumer_secret,
    })
      .then((token) => {
        this._bearer_token = token;
      })
      .finally(() => {
        this._bearer_token_promise = null;
      });

    return this._bearer_token_promise;
  }

  async authorizationHeader(url) {
    if (this.appAuth()) {
      await this.createBearerToken();
      return `Bearer ${this.bearer_token}`;
    }

    return this._oauth.toHeader(
      this._oauth.authorize(
        {
          url: url.toString(),
          method: 'get',
        },
        {
          key: this.access_token_key,
          secret: this.access_token_secret,
        }
      )
    ).Authorization;
  }
};
