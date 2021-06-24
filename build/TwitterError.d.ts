export default class TwitterError extends Error {
    constructor(message: any, code?: null | undefined, details?: string | undefined);
    static fromJson: (json: any) => TwitterError | null;
}
