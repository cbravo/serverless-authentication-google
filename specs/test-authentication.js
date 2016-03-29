"use strict";

let config = require('serverless-authentication').config;
let auth = require('../lib');

describe('Google authentication', () => {
  describe('Test Google authentication', () => {
    it('test signin with default params', () => {
      let providerConfig = config('google');
      auth.signin(providerConfig, {}, (err, data) => {
        expect(err).to.be.null;
        expect(data.url).to.equal('https://accounts.google.com/o/oauth2/v2/auth?client_id=fb-google-id&redirect_uri=https://api-id.execute-api.eu-west-1.amazonaws.com/dev/callback/google&scope=profile&response_type=code');
      });
    });

    it('tests signin with scope and state params', () => {
      let providerConfig = config('google');
      auth.signin(providerConfig, {scope: 'profile email', state: '123456'}, (err, data) => {
        expect(err).to.be.null;
        expect(data.url).to.equal('https://accounts.google.com/o/oauth2/v2/auth?client_id=fb-google-id&redirect_uri=https://api-id.execute-api.eu-west-1.amazonaws.com/dev/callback/google&scope=profile email&response_type=code&state=123456');
      });
    });
  });
});