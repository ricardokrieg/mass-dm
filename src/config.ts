if (process.env.NODE_ENV === 'test') {
  require('dotenv').config({ path: '.env.test' })
} else {
  require("dotenv").config()
}

interface IConfigAuth0 {
  domain: string
  audience: string
  client_id: string
  client_secret: string
  test_refresh_token: string
}

interface IConfig {
  port: number
  auth0: IConfigAuth0
}

const config: IConfig = {
  port: parseInt(process.env.PORT || '3001'),
  auth0: {
    domain: process.env.AUTH0_DOMAIN || '',
    audience: process.env.AUTH0_AUDIENCE || '',
    client_id: process.env.AUTH0_CLIENT_ID || '',
    client_secret: process.env.AUTH0_CLIENT_SECRET || '',
    test_refresh_token: process.env.AUTH0_TEST_REFRESH_TOKEN || '',
  },
}

export default config
