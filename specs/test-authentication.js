'use strict';

const config = require('serverless-authentication').config;
const auth = require('../lib');
const nock = require('nock');
const expect = require('chai').expect;

describe('Google authentication', () => {
  describe('Signin', () => {
    it('test signin with default params', () => {
      const providerConfig = config('google');
      auth.signinHandler(providerConfig, {}, (err, data) => {
        expect(err).to.be.null;
        expect(data.url).to.equal('https://accounts.google.com/o/oauth2/v2/auth?client_id=app-id&redirect_uri=https://api-id.execute-api.eu-west-1.amazonaws.com/dev/callback/google&response_type=code&scope=profile&access_type=online');
      });
    });

    it('tests signin with scope, state and access_type params', () => {
      const providerConfig = config('google');
      auth.signinHandler(providerConfig, {scope: 'profile email', state: '123456', access_type: 'offline'}, (err, data) => {
        expect(err).to.be.null;
        expect(data.url).to.equal('https://accounts.google.com/o/oauth2/v2/auth?client_id=app-id&redirect_uri=https://api-id.execute-api.eu-west-1.amazonaws.com/dev/callback/google&response_type=code&scope=profile email&state=123456&access_type=offline');
      });
    });

    it('tests signin with scope, state, access_type and prompt params', () => {
      const providerConfig = config('google');
      auth.signinHandler(providerConfig, {scope: 'profile email', state: '123456', access_type: 'offline', prompt: 'consent'}, (err, data) => {
        expect(err).to.be.null;
        expect(data.url).to.equal('https://accounts.google.com/o/oauth2/v2/auth?client_id=app-id&redirect_uri=https://api-id.execute-api.eu-west-1.amazonaws.com/dev/callback/google&response_type=code&scope=profile email&state=123456&access_type=offline&prompt=consent');
      });
    });

    it('test old signin with default params', () => {
      const providerConfig = config('google');
      auth.signin(providerConfig, {}, (err, data) => {
        expect(err).to.be.null;
        expect(data.url).to.equal('https://accounts.google.com/o/oauth2/v2/auth?client_id=app-id&redirect_uri=https://api-id.execute-api.eu-west-1.amazonaws.com/dev/callback/google&response_type=code&scope=profile&access_type=online');
      });
    });
  });

  describe('Callback', () => {
    before(() => {
      const providerConfig = config('google');
      nock('https://www.googleapis.com')
        .post('/oauth2/v4/token')
        .query({
          client_id: providerConfig.id,
          redirect_uri: providerConfig.redirect_uri,
          client_secret: providerConfig.secret,
          code: 'code'
        })
        .reply(200, {
          access_token: 'access-token-123'
        });

      nock('https://www.googleapis.com')
        .get('/plus/v1/people/me')
        .query({access_token: 'access-token-123'})
        .reply(200, {
          id: 'user-id-1',
          displayName: 'Eetu Tuomala',
          emails: [
            {
              value: 'email@test.com'
            }
          ],
          image: {
            url: 'https://avatars3.githubusercontent.com/u/4726921?v=3&s=460'
          }
        });
    });

    it('should return profile', (done) => {
      const providerConfig = config('google');
      auth.callbackHandler({code: 'code', state: 'state'}, providerConfig, (err, profile) => {
        expect(profile.id).to.equal('user-id-1');
        expect(profile.name).to.equal('Eetu Tuomala');
        expect(profile.email).to.equal('email@test.com');
        expect(profile.picture).to.equal('https://avatars3.githubusercontent.com/u/4726921?v=3&s=460');
        expect(profile.provider).to.equal('google');
        expect(profile.at_hash).to.equal('access-token-123');
        done(err);
      })
    });
  });

  describe('Old callback', () => {
    before(() => {
      const providerConfig = config('google');
      nock('https://www.googleapis.com')
        .post('/oauth2/v4/token')
        .query({
          client_id: providerConfig.id,
          redirect_uri: providerConfig.redirect_uri,
          client_secret: providerConfig.secret,
          code: 'code'
        })
        .reply(200, {
          access_token: 'access-token-123'
        });

      nock('https://www.googleapis.com')
        .get('/plus/v1/people/me')
        .query({access_token: 'access-token-123'})
        .reply(200, {
          id: 'user-id-1',
          displayName: 'Eetu Tuomala',
          emails: [
            {
              value: 'email@test.com'
            }
          ],
          image: {
            url: 'https://avatars3.githubusercontent.com/u/4726921?v=3&s=460'
          }
        });
    });

    it('should return profile', (done) => {
      const providerConfig = config('google');
      auth.callback({code: 'code', state: 'state'}, providerConfig, (err, profile) => {
        expect(profile.id).to.equal('user-id-1');
        expect(profile.name).to.equal('Eetu Tuomala');
        expect(profile.email).to.equal('email@test.com');
        expect(profile.picture).to.equal('https://avatars3.githubusercontent.com/u/4726921?v=3&s=460');
        expect(profile.provider).to.equal('google');
        done(err);
      })
    });
  });

  describe('Callback, partial data', () => {
    before(() => {
      const providerConfig = config('google');
      nock('https://www.googleapis.com')
        .post('/oauth2/v4/token')
        .query({
          client_id: providerConfig.id,
          redirect_uri: providerConfig.redirect_uri,
          client_secret: providerConfig.secret,
          code: 'code'
        })
        .reply(200, {
          access_token: 'access-token-123'
        });

      nock('https://www.googleapis.com')
        .get('/plus/v1/people/me')
        .query({access_token: 'access-token-123'})
        .reply(200, {
          id: 'user-id-1',
          displayName: 'Eetu Tuomala'
        });
    });

    it('should return profile', (done) => {
      const providerConfig = config('google');
      auth.callbackHandler({code: 'code', state: 'state'}, providerConfig, (err, profile) => {
        expect(profile.id).to.equal('user-id-1');
        expect(profile.name).to.equal('Eetu Tuomala');
        expect(profile.email).to.equal(null);
        expect(profile.picture).to.equal(null);
        expect(profile.provider).to.equal('google');
        done(err);
      })
    });
  });
});
