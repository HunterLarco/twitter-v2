"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const oauth_1_0a_1 = __importDefault(require("oauth-1.0a"));
const crypto_1 = __importDefault(require("crypto"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const TwitterError_1 = __importDefault(require("./TwitterError"));
function removeNullAndUndefined(obj) {
    Object.keys(obj).forEach((key) => obj[key] == null && delete obj[key]);
}
function validate(credentials) {
    if ('consumer_key' in credentials &&
        typeof credentials.consumer_key != 'string') {
        throw new Error('Invalid value for consumer_key. Expected string but got ' +
            typeof credentials.consumer_key);
    }
    if ('consumer_secret' in credentials &&
        typeof credentials.consumer_secret != 'string') {
        throw new Error('Invalid value for consumer_secret. Expected string but got ' +
            typeof credentials.consumer_secret);
    }
    if ('bearer_token' in credentials &&
        typeof credentials.bearer_token != 'string') {
        throw new Error('Invalid value for bearer_token. Expected string but got ' +
            typeof credentials.bearer_token);
    }
    if ('access_token_key' in credentials &&
        typeof credentials.access_token_key != 'string') {
        throw new Error('Invalid value for access_token_key. Expected string but got ' +
            typeof credentials.access_token_key);
    }
    if ('access_token_secret' in credentials &&
        typeof credentials.access_token_secret != 'string') {
        throw new Error('Invalid value for access_token_secret. Expected string but got ' +
            typeof credentials.access_token_secret);
    }
    if (!('access_token_key' in credentials) &&
        !('access_token_secret' in credentials) &&
        !('consumer_key' in credentials) &&
        !('consumer_secret' in credentials) &&
        !('bearer_token' in credentials)) {
        throw new Error('Invalid argument: no credentials defined');
    }
    if (('consumer_key' in credentials && !('consumer_secret' in credentials)) ||
        (!('consumer_key' in credentials) && 'consumer_secret' in credentials)) {
        throw new Error('Invalid argument: when using consumer keys, both consumer_key and ' +
            'consumer_secret must be defined');
    }
    if (('access_token_key' in credentials &&
        !('access_token_secret' in credentials)) ||
        (!('access_token_key' in credentials) &&
            'access_token_secret' in credentials)) {
        throw new Error('Invalid argument: access_token_key and access_token_secret must both ' +
            'be defined when using user authorization');
    }
    if (('access_token_key' in credentials ||
        'access_token_secret' in credentials) &&
        (!('consumer_key' in credentials) || !('consumer_secret' in credentials))) {
        throw new Error('Invalid argument: user authentication requires consumer_key and ' +
            'consumer_secret to be defined');
    }
    if (('access_token_key' in credentials ||
        'access_token_secret' in credentials) &&
        'bearer_token' in credentials) {
        throw new Error('Invalid argument: access_token_key and access_token_secret cannot be ' +
            'used with bearer_token');
    }
}
async function createBearerToken({ consumer_key, consumer_secret }) {
    const response = await node_fetch_1.default('https://api.twitter.com/oauth2/token', {
        method: 'post',
        headers: {
            Authorization: 'Basic ' +
                Buffer.from(`${consumer_key}:${consumer_secret}`).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        },
        body: 'grant_type=client_credentials',
    });
    const body = await response.json();
    if (body.errors) {
        const error = body.errors[0];
        throw new TwitterError_1.default(`${body.title}: ${error.message}`, body.type, body.detail);
    }
    if (body.token_type != 'bearer') {
        throw new TwitterError_1.default('Unexpected reply from Twitter upon obtaining bearer token', undefined, `Expected "bearer" but found ${body.token_type}`);
    }
    return body.access_token;
}
class Credentials {
    constructor(args) {
        removeNullAndUndefined(args);
        validate(args);
        if ('consumer_key' in args) {
            this._consumer_key = args.consumer_key;
            this._consumer_secret = args.consumer_secret;
        }
        if ('bearer_token' in args) {
            this._bearer_token = args.bearer_token.startsWith('Bearer ')
                ? args.bearer_token.substr(7)
                : args.bearer_token;
        }
        if ('access_token_key' in args) {
            this._access_token_key = args.access_token_key;
            this._access_token_secret = args.access_token_secret;
            this._oauth = new oauth_1_0a_1.default({
                consumer: {
                    key: args.consumer_key,
                    secret: args.consumer_secret,
                },
                signature_method: 'HMAC-SHA1',
                hash_function(base_string, key) {
                    return crypto_1.default
                        .createHmac('sha1', key)
                        .update(base_string)
                        .digest('base64');
                },
            });
        }
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
            throw new Error('Refusing to create a bearer token when using user authentication');
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
            this._bearer_token_promise = undefined;
        });
        return this._bearer_token_promise;
    }
    async authorizationHeader(url, request) {
        if (this.appAuth()) {
            await this.createBearerToken();
            return `Bearer ${this.bearer_token}`;
        }
        if (!this._oauth) {
            throw 'OAuth should be defined for user authentication';
        }
        else if (!this.access_token_key || !this.access_token_secret) {
            throw 'Access token should be defined for user authentication';
        }
        return this._oauth.toHeader(this._oauth.authorize({
            url: url.toString(),
            method: request.method,
            data: request.body,
        }, {
            key: this.access_token_key,
            secret: this.access_token_secret,
        })).Authorization;
    }
}
exports.default = Credentials;
