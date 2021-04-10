export = TwitterError;
declare class TwitterError extends Error {
    constructor(message: any, code: any, details: any);
}
declare namespace TwitterError {
    export { fromJson };
}
declare function fromJson(json: any): import("./TwitterError") | null;
