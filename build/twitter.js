"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abort_controller_1 = __importDefault(require("abort-controller"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const url_1 = require("url");
const Credentials_1 = __importDefault(require("./Credentials"));
const TwitterError_1 = __importDefault(require("./TwitterError"));
const TwitterStream_1 = __importDefault(require("./TwitterStream"));
const events_1 = __importDefault(require("events"));
function applyParameters(url, parameters, prefix) {
    prefix = prefix || '';
    if (!parameters) {
        return;
    }
    for (const [key, value] of Object.entries(parameters)) {
        if (typeof value == 'object' && value instanceof Array) {
            url.searchParams.set(prefix + key, value.join(','));
        }
        else if (typeof value == 'object') {
            applyParameters(url, value, `${prefix}${key}.`);
        }
        else {
            url.searchParams.set(prefix + key, value);
        }
    }
}
class Twitter extends events_1.default {
    constructor(args) {
        super();
        this.credentials = new Credentials_1.default(args);
        if (!process.version.match(/v12/)) {
            console.warn('There is problem with node other than 12. You should downgrade your node because of twitter API have problem with reconnection in later versions.');
        }
    }
    async get(endpoint, parameters) {
        const url = new url_1.URL(`https://api.twitter.com/2/${endpoint}`);
        applyParameters(url, parameters);
        const json = await node_fetch_1.default(url.toString(), {
            headers: {
                Authorization: await this.credentials.authorizationHeader(url, {
                    method: 'GET',
                }),
            },
        }).then((response) => {
            this.emit('headers', response.headers);
            return response.json();
        });
        const error = TwitterError_1.default.fromJson(json);
        if (error) {
            throw error;
        }
        return json;
    }
    async post(endpoint, body, parameters) {
        const url = new url_1.URL(`https://api.twitter.com/2/${endpoint}`);
        applyParameters(url, parameters);
        const json = await node_fetch_1.default(url.toString(), {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                Authorization: await this.credentials.authorizationHeader(url, {
                    method: 'POST',
                    body: body,
                }),
            },
            body: JSON.stringify(body || {}),
        }).then((response) => {
            this.emit('headers', response.headers);
            return response.json();
        });
        const error = TwitterError_1.default.fromJson(json);
        if (error) {
            throw error;
        }
        return json;
    }
    async delete(endpoint, parameters) {
        const url = new url_1.URL(`https://api.twitter.com/2/${endpoint}`);
        applyParameters(url, parameters);
        const json = await node_fetch_1.default(url.toString(), {
            method: 'delete',
            headers: {
                Authorization: await this.credentials.authorizationHeader(url, {
                    method: 'DELETE',
                }),
            },
        }).then((response) => {
            this.emit('headers', response.headers);
            return response.json();
        });
        const error = TwitterError_1.default.fromJson(json);
        if (error) {
            throw error;
        }
        return json;
    }
    stream(endpoint, parameters, options) {
        const abortController = new abort_controller_1.default();
        const ts = new TwitterStream_1.default(async () => {
            const url = new url_1.URL(`https://api.twitter.com/2/${endpoint}`);
            applyParameters(url, parameters);
            return node_fetch_1.default(url.toString(), {
                signal: abortController.signal,
                headers: {
                    Authorization: await this.credentials.authorizationHeader(url, {
                        method: 'GET',
                    }),
                },
            });
        }, () => {
            abortController.abort();
        }, options || {});
        ts.on('headers', (h) => this.emit('headers', h));
        ts.on('data', (h) => this.emit('data', h));
        ts.on('error', (h) => this.emit('error', h));
        ts.on('end', (h) => this.emit('end', h));
        return ts;
    }
}
exports.default = Twitter;
module.exports = Twitter;
