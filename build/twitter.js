"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abort_controller_1 = __importDefault(require("abort-controller"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const url_1 = require("url");
const Credentials_1 = __importDefault(require("./Credentials"));
const TwitterError_js_1 = __importDefault(require("./TwitterError.js"));
const TwitterStream_1 = __importDefault(require("./TwitterStream"));
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
class Twitter {
    constructor(args) {
        this.credentials = new Credentials_1.default(args);
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
        }).then((response) => response.json());
        const error = TwitterError_js_1.default.fromJson(json);
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
        }).then((response) => response.json());
        const error = TwitterError_js_1.default.fromJson(json);
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
        }).then((response) => response.json());
        const error = TwitterError_js_1.default.fromJson(json);
        if (error) {
            throw error;
        }
        return json;
    }
    stream(endpoint, parameters, options) {
        const abortController = new abort_controller_1.default();
        return new TwitterStream_1.default(async () => {
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
    }
}
exports.default = Twitter;
module.exports = Twitter;
