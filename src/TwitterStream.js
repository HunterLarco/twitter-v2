const split = require('split');

const TwitterError = require('./TwitterError.js');

const State = {
  NOT_STARTED: Symbol('NOT_STARTED'),
  STARTED: Symbol('STARTED'),
  CLOSED: Symbol('CLOSED'),
};

class DeferredPromise {
  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}

class TwitterStream {
  constructor(connect, close) {
    this._connect = connect;
    this._close = close;

    this._state = State.NOT_STARTED;
    this._events = [new DeferredPromise()];
  }

  _emit(promise) {
    this._events[this._events.length - 1].resolve(promise);
    this._events.push(new DeferredPromise());
  }

  _closeWithError(error) {
    if (this._state !== State.CLOSED) {
      this._state = State.CLOSED;
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
          const stream = response.body.pipe(split());

          stream.on('data', (line) => {
            if (!line.trim()) {
              return;
            }

            if (line == 'Rate limit exceeded') {
              this._emit(
                Promise.reject(new TwitterError('Rate limit exceeded'))
              );
              this.close();
              return;
            }

            const json = JSON.parse(line);

            const error = TwitterError.fromJson(json);
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
      this._emit(Promise.resolve({ done: true }));
      this._close();
    }
  }
}

module.exports = TwitterStream;
