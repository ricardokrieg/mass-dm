if (process.env.NODE_ENV === 'test') {
  require('dotenv').config({ path: '.env.test' })
} else {
  require("dotenv").config()
}

interface IConfigAuth0 {
  domain: string,
  audience: string,
}

interface IConfigTables {
  campaigns: string,
}

interface IConfig {
  port: number,
  auth0: IConfigAuth0,
  tables: IConfigTables,
}

const config: IConfig = {
  port: parseInt(process.env.PORT || '3001'),
  auth0: {
    domain: process.env.AUTH0_DOMAIN || '',
    audience: process.env.AUTH0_AUDIENCE || '',
  },
  tables: {
    campaigns: process.env.CAMPAIGNS_TABLE || '',
  },
}

export default config
