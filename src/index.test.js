const { config } = require('serverless-authentication')
const nock = require('nock')
const authentication = require('./index')

describe('Google authentication', () => {
  beforeAll(() => {
    process.env.PROVIDER_GOOGLE_ID = 'app-id'
    process.env.PROVIDER_GOOGLE_SECRET = 'app-secret'
    process.env.REDIRECT_CLIENT_URI = 'http://localhost:3000/auth/{provider}/'
    process.env.REDIRECT_URI =
      'https://api-id.execute-api.eu-west-1.amazonaws.com/dev/callback/{provider}'
    process.env.TOKEN_SECRET = 'token-secret-123'
  })

  describe('Signin', () => {
    it('test signin with default params', async () => {
      const providerConfig = config({ provider: 'google' })
      const data = await authentication.signinHandler(providerConfig, {})
      expect(data.url).toBe(
        'https://accounts.google.com/o/oauth2/v2/auth?client_id=app-id&redirect_uri=https://api-id.execute-api.eu-west-1.amazonaws.com/dev/callback/google&response_type=code&scope=profile&access_type=online'
      )
    })

    it('tests signin with scope, state and access_type params', async () => {
      const providerConfig = config({ provider: 'google' })
      const data = await authentication.signinHandler(providerConfig, {
        scope: 'profile email',
        state: '123456',
        access_type: 'offline'
      })
      expect(data.url).toBe(
        'https://accounts.google.com/o/oauth2/v2/auth?client_id=app-id&redirect_uri=https://api-id.execute-api.eu-west-1.amazonaws.com/dev/callback/google&response_type=code&scope=profile email&state=123456&access_type=offline'
      )
    })

    it('tests signin with scope, state, access_type and prompt params', async () => {
      const providerConfig = config({ provider: 'google' })
      const data = await authentication.signinHandler(providerConfig, {
        scope: 'profile email',
        state: '123456',
        access_type: 'offline',
        prompt: 'consent'
      })
      expect(data.url).toBe(
        'https://accounts.google.com/o/oauth2/v2/auth?client_id=app-id&redirect_uri=https://api-id.execute-api.eu-west-1.amazonaws.com/dev/callback/google&response_type=code&scope=profile email&state=123456&access_type=offline&prompt=consent'
      )
    })
  })

  describe('Callback', () => {
    beforeAll(() => {
      const providerConfig = config({ provider: 'google' })
      nock('https://www.googleapis.com')
        .post(
          '/oauth2/v4/token',
          ({
            client_id, redirect_uri, client_secret, code
          }) =>
            client_id === providerConfig.id &&
            redirect_uri === providerConfig.redirect_uri &&
            client_secret === providerConfig.secret &&
            code === 'code'
        )
        .reply(200, {
          access_token: 'access-token-123'
        })

      nock('https://www.googleapis.com')
        .get('/plus/v1/people/me')
        .query({ access_token: 'access-token-123' })
        .reply(200, {
          id: 'user-id-1',
          displayName: 'Eetu Tuomala',
          emails: [
            {
              value: 'email@test.com'
            }
          ],
          image: {
            url: 'https://avatars3.githubusercontent.com/u/4726921?v=3&s=460'
          }
        })
    })

    it('should return profile', async () => {
      const providerConfig = config({ provider: 'google' })
      const profile = await authentication.callbackHandler(
        { code: 'code', state: 'state' },
        providerConfig
      )
      expect(profile.id).toBe('user-id-1')
      expect(profile.name).toBe('Eetu Tuomala')
      expect(profile.email).toBe('email@test.com')
      expect(profile.picture).toBe(
        'https://avatars3.githubusercontent.com/u/4726921?v=3&s=460'
      )
      expect(profile.provider).toBe('google')
    })
  })
})
