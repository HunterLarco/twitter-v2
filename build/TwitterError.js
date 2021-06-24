"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class TwitterError extends Error {
    constructor(message, code = undefined, details = undefined) {
        super(message);
        if (code) {
            Object.defineProperty(this, 'code', {
                value: code,
                writable: false,
                enumerable: true,
            });
        }
        if (details) {
            Object.defineProperty(this, 'details', {
                value: details,
                writable: false,
                enumerable: true,
            });
        }
    }
}
exports.default = TwitterError;
TwitterError.fromJson = (json) => {
    if (json.status && json.status !== 200) {
        return new TwitterError(json.title, json.status, json.detail);
    }
    if (json.type) {
        return new TwitterError(`${json.title}: ${json.detail}`, null, json.type);
    }
    return null;
};
