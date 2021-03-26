export interface StreamOptions {
  // Number of seconds to wait for data or a heartbeat ping from Twitter before
  // considering the stream closed (default value is 30 seconds).
  timeout: number | undefined;
}

export class TwitterStream<T> implements AsyncIterable<T> {
  constructor(
    connect: () => Promise<any>,
    close: () => void,
    options: StreamOptions
  );

  [Symbol.asyncIterator](): AsyncIterator<T>;

  public close(): void;
}
