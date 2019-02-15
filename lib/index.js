'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _serverlessAuthentication = require('serverless-authentication');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function mapProfile(response) {
  var overwrites = {
    name: response.name,
    email: response.email,
    picture: response.picture,
    provider: 'google'
  };

  return new _serverlessAuthentication.Profile(Object.assign(response, overwrites));
}

var GoogleProvider = function (_Provider) {
  _inherits(GoogleProvider, _Provider);

  function GoogleProvider() {
    _classCallCheck(this, GoogleProvider);

    return _possibleConstructorReturn(this, (GoogleProvider.__proto__ || Object.getPrototypeOf(GoogleProvider)).apply(this, arguments));
  }

  _createClass(GoogleProvider, [{
    key: 'signinHandler',
    value: function signinHandler(_ref) {
      var _ref$scope = _ref.scope,
          scope = _ref$scope === undefined ? 'profile' : _ref$scope,
          state = _ref.state,
          _ref$access_type = _ref.access_type,
          access_type = _ref$access_type === undefined ? 'online' : _ref$access_type,
          prompt = _ref.prompt;

      var variableOptions = { scope: scope, state: state, access_type: access_type };
      if (prompt) {
        Object.assign(variableOptions, { prompt: prompt });
      }
      var options = Object.assign(variableOptions, {
        signin_uri: 'https://accounts.google.com/o/oauth2/v2/auth',
        response_type: 'code'
      });

      return _get(GoogleProvider.prototype.__proto__ || Object.getPrototypeOf(GoogleProvider.prototype), 'signin', this).call(this, options);
    }
  }, {
    key: 'callbackHandler',
    value: function callbackHandler(event) {
      var options = {
        authorization_uri: 'https://www.googleapis.com/oauth2/v4/token',
        profile_uri: 'https://www.googleapis.com/userinfo/v2/me',
        profileMap: mapProfile,
        authorizationMethod: 'POST'
      };

      return _get(GoogleProvider.prototype.__proto__ || Object.getPrototypeOf(GoogleProvider.prototype), 'callback', this).call(this, event, options, {
        authorization: { grant_type: 'authorization_code' }
      });
    }
  }]);

  return GoogleProvider;
}(_serverlessAuthentication.Provider);

var signinHandler = function signinHandler(config, options) {
  return new GoogleProvider(config).signinHandler(options);
};

var callbackHandler = function callbackHandler(event, config) {
  return new GoogleProvider(config).callbackHandler(event);
};

exports.signinHandler = signinHandler;
exports.callbackHandler = callbackHandler;