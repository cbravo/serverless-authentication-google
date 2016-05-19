'use strict';

import { Profile, Provider } from 'serverless-authentication';

function mapProfile(response) {
  return new Profile({
    id: response.id,
    name: response.displayName,
    email: response.emails ? response.emails[0].value : null,
    picture: response.image ? response.image.url : null,
    provider: 'google',
    _raw: response
  });
}

class GoogleProvider extends Provider {
  signinHandler({ scope = 'profile', state }, callback) {
    const options = Object.assign(
      { scope, state },
      { signin_uri: 'https://accounts.google.com/o/oauth2/v2/auth', response_type: 'code' }
    );
    super.signin(options, callback);
  }

  callbackHandler(event, callback) {
    const options = {
      authorization_uri: 'https://www.googleapis.com/oauth2/v4/token',
      profile_uri: 'https://www.googleapis.com/plus/v1/people/me',
      profileMap: mapProfile,
      authorizationMethod: 'POST'
    };
    super.callback(
      event,
      options,
      { authorization: { grant_type: 'authorization_code' } },
      callback
    );
  }
}

export function signinHandler(config, options, callback) {
  (new GoogleProvider(config)).signinHandler(options, callback);
}

export function callbackHandler(event, config, callback) {
  (new GoogleProvider(config)).callbackHandler(event, callback);
}
