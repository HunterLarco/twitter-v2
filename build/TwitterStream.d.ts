/// <reference types="node" />
import EventEmitter from 'events';
export declare interface StreamOptions {
    timeout?: number;
}
export default class TwitterStream extends EventEmitter {
    private readonly _connect;
    private readonly _close;
    private _state;
    private readonly _events;
    private _timeout?;
    private readonly _wait;
    constructor(connect: () => Promise<any>, close: () => void, options: StreamOptions);
    _emit(promise: any): void;
    _refreshTimeout(): void;
    _closeWithError(error: any): void;
    [Symbol.asyncIterator](): {
        next: () => Promise<any>;
    };
    close(): void;
}
