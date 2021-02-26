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

  [Symbol.asyncIterator]() {
    if (this._state == State.CLOSED) {
      throw new Error('Stream has already been closed.');
    }

    return {
      next: async () => {
        if (this._state == State.NOT_STARTED) {
          this._state = State.STARTED;

          const response = await this._connect();
          response.body.pipe(split()).on('data', (line) => {
            if (!line.trim()) {
                this._emit(Promise.resolve({ done: false, value: null }));
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
              this._emit(Promise.reject(error));
              this.close();
              return;
            }

            this._emit(Promise.resolve({ done: false, value: json }));
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
    this._state = State.CLOSED;
    this._emit(Promise.resolve({ done: true }));
    this._close();
  }
}

module.exports = TwitterStream;
