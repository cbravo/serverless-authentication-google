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
      profileMap: mapProfile
    };
    super.callback(event, options, {grant_type: 'authorization_code'}, callback);
  }
}

export function signin(config, options, callback) {
  (new GoogleProvider(config)).signin(options, callback);
}

export function callback(event, config, callback) {
  (new GoogleProvider(config)).callback(event, callback);
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

// function signin({id, redirect_uri}, {scope = 'profile', state}, callback) {
//   let params = {
//     client_id: id,
//     redirect_uri,
//     scope,
//     response_type: 'code'
//   };
//
//   if(state) {
//     params.state = state;
//   }
//
//   let url = utils.urlBuilder('https://accounts.google.com/o/oauth2/v2/auth', params);
//   callback(null, {url});
// }
//
// function callback({code, state}, {id, redirect_uri, secret}, callback) {
//   async.waterfall([
//     (callback) => {
//       let payload = {
//         client_id: id,
//         redirect_uri,
//         client_secret: secret,
//         code,
//         grant_type: 'authorization_code'
//       };
//       request.post('https://www.googleapis.com/oauth2/v4/token', {form: payload}, callback);
//     },
//     (response, accessData, callback) => {
//       let {access_token} = JSON.parse(accessData);
//       let url = utils.urlBuilder('https://www.googleapis.com/plus/v1/people/me', {access_token});
//       request.get(url, (error, response, profileData) => {
//         if(!error) {
//           callback(null, mapProfile(JSON.parse(profileData)));
//         } else {
//           callback(err);
//         }
//       });
//     }
//   ], (err, data) => {
//     callback(err, data, state);
//   });
// }
//
