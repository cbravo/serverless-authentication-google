'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

exports.signin = signin;
exports.callback = callback;

var _serverlessAuthentication = require('serverless-authentication');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var GoogleProvider = function (_Provider) {
  _inherits(GoogleProvider, _Provider);

  function GoogleProvider() {
    _classCallCheck(this, GoogleProvider);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(GoogleProvider).apply(this, arguments));
  }

  _createClass(GoogleProvider, [{
    key: 'signin',
    value: function signin(_ref, callback) {
      var _ref$scope = _ref.scope;
      var scope = _ref$scope === undefined ? 'profile' : _ref$scope;
      var state = _ref.state;

      var options = Object.assign({ scope: scope, state: state }, { signin_uri: 'https://accounts.google.com/o/oauth2/v2/auth', response_type: 'code' });
      _get(Object.getPrototypeOf(GoogleProvider.prototype), 'signin', this).call(this, options, callback);
    }
  }, {
    key: 'callback',
    value: function callback(event, _callback) {
      var options = {
        authorization_uri: 'https://www.googleapis.com/oauth2/v4/token',
        profile_uri: 'https://www.googleapis.com/plus/v1/people/me',
        profileMap: mapProfile
      };
      _get(Object.getPrototypeOf(GoogleProvider.prototype), 'callback', this).call(this, event, options, { grant_type: 'authorization_code' }, _callback);
    }
  }]);

  return GoogleProvider;
}(_serverlessAuthentication.Provider);

function signin(config, options, callback) {
  new GoogleProvider(config).signin(options, callback);
}

function callback(event, config, callback) {
  new GoogleProvider(config).callback(event, callback);
}

function mapProfile(response) {
  return new _serverlessAuthentication.Profile({
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