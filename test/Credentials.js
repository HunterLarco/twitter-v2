import { expect } from 'chai';

import Credentials from '../src/Credentials';

describe('Credentials', () => {
  it('should enforce that credentials are defined', () => {
    expect(() => new Credentials({})).to.throw(
      'Invalid argument: no credentials defined'
    );
  });

  it('should enforce consumer key and secret parity', () => {
    expect(
      () =>
        new Credentials({
          consumer_key: 'foo',
        })
    ).to.throw(
      'Invalid argument: when using consumer keys, both consumer_key and ' +
        'consumer_secret must be defined'
    );

    expect(
      () =>
        new Credentials({
          consumer_secret: 'bar',
        })
    ).to.throw(
      'Invalid argument: when using consumer keys, both consumer_key and ' +
        'consumer_secret must be defined'
    );

    expect(
      () =>
        new Credentials({
          consumer_key: 'foo',
          consumer_secret: 'bar',
        })
    ).to.not.throw();
  });

  it('should enforce access key and secret parity', () => {
    expect(
      () =>
        new Credentials({
          consumer_key: 'foo',
          consumer_secret: 'bar',
          access_token_key: 'qux',
        })
    ).to.throw(
      'Invalid argument: access_token_key and access_token_secret must both ' +
        'be defined when using user authorization'
    );

    expect(
      () =>
        new Credentials({
          consumer_key: 'foo',
          consumer_secret: 'bar',
          access_token_secret: 'qux',
        })
    ).to.throw(
      'Invalid argument: access_token_key and access_token_secret must both ' +
        'be defined when using user authorization'
    );

    expect(
      () =>
        new Credentials({
          consumer_key: 'foo',
          consumer_secret: 'bar',
          access_token_key: 'qux',
          access_token_secret: 'quz',
        })
    ).to.not.throw();
  });

  it('should disallow using bearer token with user auth', () => {
    expect(
      () =>
        new Credentials({
          consumer_key: 'foo',
          consumer_secret: 'bar',
          bearer_token: 'invalid',
          access_token_key: 'qux',
          access_token_secret: 'quz',
        })
    ).to.throw(
      'Invalid argument: access_token_key and access_token_secret cannot be ' +
        'used with bearer_token'
    );
  });

  it('should accept either consumer keys or bearer token for app auth', () => {
    expect(
      () =>
        new Credentials({
          consumer_key: 'foo',
          consumer_secret: 'bar',
        })
    ).to.not.throw();

    expect(
      () =>
        new Credentials({
          bearer_token: 'baz',
        })
    ).to.not.throw();

    expect(
      () =>
        new Credentials({
          consumer_key: 'foo',
          consumer_secret: 'bar',
          bearer_token: 'baz',
        })
    ).to.not.throw();
  });

  it('should recognize app vs user auth', () => {
    let credentials = new Credentials({
      consumer_key: 'foo',
      consumer_secret: 'bar',
    });
    expect(credentials.appAuth()).to.be.true;
    expect(credentials.userAuth()).to.be.false;

    credentials = new Credentials({
      bearer_token: 'foo',
    });
    expect(credentials.appAuth()).to.be.true;
    expect(credentials.userAuth()).to.be.false;

    credentials = new Credentials({
      consumer_key: 'foo',
      consumer_secret: 'bar',
      bearer_token: 'qux',
    });
    expect(credentials.appAuth()).to.be.true;
    expect(credentials.userAuth()).to.be.false;

    credentials = new Credentials({
      consumer_key: 'foo',
      consumer_secret: 'bar',
      access_token_key: 'qux',
      access_token_secret: 'quz',
    });
    expect(credentials.appAuth()).to.be.false;
    expect(credentials.userAuth()).to.be.true;
  });
});
