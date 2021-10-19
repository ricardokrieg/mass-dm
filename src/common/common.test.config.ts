import request from 'request-promise'

import config from '../config'

export interface AccessToken {
  access_token: string
  scope: string
  expires_in: number
  token_type: string
}

export const getAccessToken = async (): Promise<AccessToken> => {
  const url = `https://${config.auth0.domain}/oauth/token`
  const form = {
    grant_type: 'refresh_token',
    client_id: config.auth0.client_id,
    client_secret: config.auth0.client_secret,
    refresh_token: config.auth0.test_refresh_token,
    redirect_uri: 'http://example.com'
  }

  const response = await request(url, { method: 'POST', form })

  return JSON.parse(response) as AccessToken
}
