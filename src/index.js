'use strict';

import {Profile, Provider} from 'serverless-authentication';

class GoogleProvider extends Provider {
  signin({scope = 'profile', state}, callback){
    let options = Object.assign(
      {scope, state},
      {signin_uri: 'https://accounts.google.com/o/oauth2/v2/auth', response_type: 'code'}
    );
    super.signin(options, callback);
  }

  callback(event, callback){
    var options = {
      authorization_uri: 'https://www.googleapis.com/oauth2/v4/token',
      profile_uri: 'https://www.googleapis.com/plus/v1/people/me',
      profileMap: mapProfile,
      authorizationMethod: 'POST'
    };
    super.callback(event, options, {grant_type: 'authorization_code'}, callback);
  }
}

function mapProfile(response) {
  return new Profile({
    id: response.id,
    name: response.displayName,
    email: response.emails ? response.emails[0].value : null,
    picture: response.image.url,
    provider: 'google',
    _raw: response
  });
}

export function signin(config, options, callback) {
  (new GoogleProvider(config)).signin(options, callback);
}

export function callback(event, config, callback) {
  (new GoogleProvider(config)).callback(event, callback);
}