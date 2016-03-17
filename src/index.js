'use strict';

import async from 'async';
import request from 'request';
import {utils, Profile} from 'serverless-authentication';

export function signin(config, options, callback) {
  let params = {
    client_id: config.id,
    redirect_uri: config.redirect_uri,
    scope: options.scope || 'profile',
    response_type: 'code'
  };
  let url = utils.urlBuilder('https://accounts.google.com/o/oauth2/v2/auth', params);
  callback(null, {url: url});
}

export function callback(event, config, callback) {
  async.waterfall([
    (callback) => {
      let payload = {
        client_id: config.id,
        redirect_uri: config.redirect_uri,
        client_secret: config.secret,
        code: event.code,
        grant_type: 'authorization_code'
      };
      request.post('https://www.googleapis.com/oauth2/v4/token', {form: payload}, callback);
    },
    (response, data, callback) => {
      let d = JSON.parse(data);
      let url = utils.urlBuilder('https://www.googleapis.com/plus/v1/people/me', {access_token: d.access_token});
      request.get(url, (error, response, data) => {
        console.log(err, response, data);
        if(!error) {
          callback(null, mapProfile(JSON.parse(data)));
        } else {
          callback(err);
        }
      });
    }
  ], (err, data) => {
    callback(err, data);
  });
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