export default class TwitterError extends Error {
    constructor(message: any, code?: undefined, details?: string | undefined);
    static fromJson: (json: any) => any;
}
