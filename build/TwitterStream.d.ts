export declare interface StreamOptions {
    timeout?: number;
}
export default class TwitterStream {
    private _connect;
    private _close;
    private _state;
    private _events;
    private _timeout?;
    private _wait;
    constructor(connect: () => Promise<any>, close: () => void, options: StreamOptions);
    _emit(promise: any): void;
    _refreshTimeout(): void;
    _closeWithError(error: any): void;
    [Symbol.asyncIterator](): {
        next: () => Promise<any>;
    };
    close(): void;
}
