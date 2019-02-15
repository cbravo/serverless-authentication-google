'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var _require = require('serverless-authentication'),
    config = _require.config;

var nock = require('nock');
var authentication = require('./index');

describe('Google authentication', function () {
  beforeAll(function () {
    process.env.PROVIDER_GOOGLE_ID = 'app-id';
    process.env.PROVIDER_GOOGLE_SECRET = 'app-secret';
    process.env.REDIRECT_CLIENT_URI = 'http://localhost:3000/auth/{provider}/';
    process.env.REDIRECT_URI = 'https://api-id.execute-api.eu-west-1.amazonaws.com/dev/callback/{provider}';
    process.env.TOKEN_SECRET = 'token-secret-123';
  });

  describe('Signin', function () {
    it('test signin with default params', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
      var providerConfig, data;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              providerConfig = config({ provider: 'google' });
              _context.next = 3;
              return authentication.signinHandler(providerConfig, {});

            case 3:
              data = _context.sent;

              expect(data.url).toBe('https://accounts.google.com/o/oauth2/v2/auth?client_id=app-id&redirect_uri=https://api-id.execute-api.eu-west-1.amazonaws.com/dev/callback/google&response_type=code&scope=profile&access_type=online');

            case 5:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, undefined);
    })));

    it('tests signin with scope, state and access_type params', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
      var providerConfig, data;
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              providerConfig = config({ provider: 'google' });
              _context2.next = 3;
              return authentication.signinHandler(providerConfig, {
                scope: 'profile email',
                state: '123456',
                access_type: 'offline'
              });

            case 3:
              data = _context2.sent;

              expect(data.url).toBe('https://accounts.google.com/o/oauth2/v2/auth?client_id=app-id&redirect_uri=https://api-id.execute-api.eu-west-1.amazonaws.com/dev/callback/google&response_type=code&scope=profile email&state=123456&access_type=offline');

            case 5:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, undefined);
    })));

    it('tests signin with scope, state, access_type and prompt params', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
      var providerConfig, data;
      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              providerConfig = config({ provider: 'google' });
              _context3.next = 3;
              return authentication.signinHandler(providerConfig, {
                scope: 'profile email',
                state: '123456',
                access_type: 'offline',
                prompt: 'consent'
              });

            case 3:
              data = _context3.sent;

              expect(data.url).toBe('https://accounts.google.com/o/oauth2/v2/auth?client_id=app-id&redirect_uri=https://api-id.execute-api.eu-west-1.amazonaws.com/dev/callback/google&response_type=code&scope=profile email&state=123456&access_type=offline&prompt=consent');

            case 5:
            case 'end':
              return _context3.stop();
          }
        }
      }, _callee3, undefined);
    })));
  });

  describe('Callback', function () {
    beforeAll(function () {
      var providerConfig = config({ provider: 'google' });
      nock('https://www.googleapis.com').post('/oauth2/v4/token', function (_ref4) {
        var client_id = _ref4.client_id,
            redirect_uri = _ref4.redirect_uri,
            client_secret = _ref4.client_secret,
            code = _ref4.code;
        return client_id === providerConfig.id && redirect_uri === providerConfig.redirect_uri && client_secret === providerConfig.secret && code === 'code';
      }).reply(200, {
        access_token: 'access-token-123'
      });

      nock('https://www.googleapis.com').get('/userinfo/v2/me').query({ access_token: 'access-token-123' }).reply(200, {
        id: 'user-id-1',
        name: 'Eetu Tuomala',
        email: 'email@test.com',
        picture: 'https://avatars3.githubusercontent.com/u/4726921?v=3&s=460'
      });
    });

    it('should return profile', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
      var providerConfig, profile;
      return regeneratorRuntime.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              providerConfig = config({ provider: 'google' });
              _context4.next = 3;
              return authentication.callbackHandler({ code: 'code', state: 'state' }, providerConfig);

            case 3:
              profile = _context4.sent;

              console.log(profile);
              expect(profile.id).toBe('user-id-1');
              expect(profile.name).toBe('Eetu Tuomala');
              expect(profile.email).toBe('email@test.com');
              expect(profile.picture).toBe('https://avatars3.githubusercontent.com/u/4726921?v=3&s=460');
              expect(profile.provider).toBe('google');

            case 10:
            case 'end':
              return _context4.stop();
          }
        }
      }, _callee4, undefined);
    })));
  });
});