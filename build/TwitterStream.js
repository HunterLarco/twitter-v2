"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const split_1 = __importDefault(require("split"));
const TwitterError_1 = __importDefault(require("./TwitterError"));
var State;
(function (State) {
    State[State["NOT_STARTED"] = 0] = "NOT_STARTED";
    State[State["STARTED"] = 1] = "STARTED";
    State[State["CLOSED"] = 2] = "CLOSED";
})(State || (State = {}));
class DeferredPromise {
    constructor() {
        this.resolve = () => { };
        this.reject = () => { };
        this.promise = new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
    }
}
class TwitterStream {
    constructor(connect, close, options) {
        const { timeout = 30 } = options;
        this._connect = connect;
        this._close = close;
        this._state = State.NOT_STARTED;
        this._events = [new DeferredPromise()];
        this._wait = timeout * 1000;
    }
    _emit(promise) {
        this._events[this._events.length - 1].resolve(promise);
        this._events.push(new DeferredPromise());
    }
    _refreshTimeout() {
        if (this._state !== State.CLOSED) {
            if (this._timeout) {
                clearTimeout(this._timeout);
            }
            this._timeout = setTimeout(() => {
                this._closeWithError(new TwitterError_1.default('Stream unresponsive'));
            }, this._wait);
        }
    }
    _closeWithError(error) {
        if (this._state !== State.CLOSED) {
            this._state = State.CLOSED;
            if (this._timeout) {
                clearTimeout(this._timeout);
            }
            this._emit(Promise.reject(error));
            this._close();
        }
    }
    [Symbol.asyncIterator]() {
        if (this._state == State.CLOSED) {
            throw new Error('Stream has already been closed.');
        }
        return {
            next: async () => {
                if (this._state == State.NOT_STARTED) {
                    this._state = State.STARTED;
                    const response = await this._connect();
                    const stream = response.body.pipe(split_1.default());
                    this._refreshTimeout();
                    stream.on('data', (line) => {
                        this._refreshTimeout();
                        if (!line.trim()) {
                            return;
                        }
                        if (line == 'Rate limit exceeded') {
                            this._closeWithError(new TwitterError_1.default('Rate limit exceeded'));
                            return;
                        }
                        const json = JSON.parse(line);
                        const error = TwitterError_1.default.fromJson(json);
                        if (error) {
                            this._closeWithError(error);
                            return;
                        }
                        this._emit(Promise.resolve({ done: false, value: json }));
                    });
                    stream.on('error', (error) => {
                        this._closeWithError(error);
                    });
                    stream.on('end', (error) => {
                        this.close();
                    });
                }
                const event = this._events[0];
                return event.promise.finally(() => {
                    if (event === this._events[0]) {
                        this._events.shift();
                    }
                });
            },
        };
    }
    close() {
        if (this._state !== State.CLOSED) {
            this._state = State.CLOSED;
            if (this._timeout) {
                clearTimeout(this._timeout);
            }
            this._emit(Promise.resolve({ done: true }));
            this._close();
        }
    }
}
exports.default = TwitterStream;
