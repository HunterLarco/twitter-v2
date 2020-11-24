export class TwitterStream<T> implements AsyncIterable<T> {
  constructor(connect: () => Promise<any>, close: () => void);

  [Symbol.asyncIterator](): AsyncIterator<T>;

  public close(): void;
}
