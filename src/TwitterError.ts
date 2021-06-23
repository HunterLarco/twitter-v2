export default class TwitterError extends Error {
  constructor(
    message,
    code = undefined,
    details: string | undefined = undefined
  ) {
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

  static fromJson = (json) => {
    if (json.status && json.status !== 200) {
      return new module.exports(json.title, json.status, json.detail);
    }

    if (json.type) {
      return new module.exports(
        `${json.title}: ${json.detail}`,
        null,
        json.type
      );
    }

    return null;
  };
}
