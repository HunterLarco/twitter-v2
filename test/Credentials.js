const { expect } = require('chai');

const Credentials = require('../src/Credentials.js');

describe('Credentials', () => {
  it('should require a consumer key and secret', () => {
    expect(() => new Credentials({})).to.throw(
      'Missing required argument: consumer_key'
    );

    expect(() => new Credentials({ consumer_key: 'foo' })).to.throw(
      'Missing required argument: consumer_secret'
    );

    expect(
      () => new Credentials({ consumer_key: 'foo', consumer_secret: 'bar' })
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
      'Invalid argument: access_token_key and access_token_secret should not ' +
        'be used with bearer_token'
    );
  });

  it('should recognize app vs user auth', () => {
    let credentials = new Credentials({
      consumer_key: 'foo',
      consumer_secret: 'bar',
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
