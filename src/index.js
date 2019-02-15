'use strict';

import { Profile, Provider } from 'serverless-authentication';

function mapProfile(response) {
  const overwrites = {
    name: response.name,
    email: response.email,
    picture: response.picture,
    provider: 'google'
  };

  return new Profile(Object.assign(response, overwrites));
}

class GoogleProvider extends Provider {
  signinHandler({
 scope = 'profile', state, access_type = 'online', prompt 
}, callback) {
    const variableOptions = { scope, state, access_type };
    if (prompt) {
      Object.assign(variableOptions, { prompt });
    }
    const options = Object.assign(
      variableOptions,
      { signin_uri: 'https://accounts.google.com/o/oauth2/v2/auth', response_type: 'code' }
    );

    super.signin(options, callback);
  }

  callbackHandler(event, callback) {
    const options = {
      authorization_uri: 'https://www.googleapis.com/oauth2/v4/token',
      profile_uri: 'https://www.googleapis.com/userinfo/v2/me',
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

const signinHandler = (config, options, callback) => (new GoogleProvider(config)).signinHandler(options, callback);

const callbackHandler = (event, config, callback) => (new GoogleProvider(config)).callbackHandler(event, callback);

exports.signinHandler = signinHandler;
exports.signin = signinHandler; // old syntax, remove later
exports.callbackHandler = callbackHandler;
exports.callback = callbackHandler; // old syntax, remove later
