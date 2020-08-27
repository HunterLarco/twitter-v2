class TwitterError extends Error {
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
}

module.exports = TwitterError;
