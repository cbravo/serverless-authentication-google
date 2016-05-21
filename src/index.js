'use strict';

import { Profile, Provider } from 'serverless-authentication';

function mapProfile(response) {
  const overwrites = {
    name: response.displayName,
    email: response.emails ? response.emails[0].value : null,
    picture: response.image ? response.image.url : null,
    provider: 'google'
  };

  return new Profile(Object.assign(response, overwrites));
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

const signinHandler = (config, options, callback) =>
  (new GoogleProvider(config)).signinHandler(options, callback);

const callbackHandler = (event, config, callback) =>
  (new GoogleProvider(config)).callbackHandler(event, callback);

exports.signinHandler = signinHandler;
exports.signin = signinHandler; // old syntax, remove later
exports.callbackHandler = callbackHandler;
exports.callback = callbackHandler; // old syntax, remove later
