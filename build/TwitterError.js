"use strict";
module.exports = class TwitterError extends Error {
    constructor(message, code, details) {
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
};
module.exports.fromJson = (json) => {
    if (json.status && json.status != 200) {
        return new module.exports(json.title, json.status, json.detail);
    }
    if (json.type) {
        return new module.exports(`${json.title}: ${json.detail}`, null, json.type);
    }
    return null;
};
