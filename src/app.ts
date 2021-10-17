import express from 'express'
import jwt from 'express-jwt'
import jwks from 'jwks-rsa'
import cors from 'cors'
import * as winston from 'winston'
import * as expressWinston from 'express-winston'
import debug from 'debug'

import {default as config} from './config'
// import campaignRouter from './Campaign/Campaign.router'
import {CampaignsRoutes} from './campaigns/campaigns.routes'
import {CommonRoutesConfig} from './common/common.routes.config'

const jwtCheck = jwt({
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${config.auth0.domain}/.well-known/jwks.json`
  }),
  audience: config.auth0.audience,
  issuer: `https://${config.auth0.domain}/`,
  algorithms: ['RS256']
})

const debugLog: debug.IDebugger = debug('app')
const routes: Array<CommonRoutesConfig> = []

const loggerOptions: expressWinston.LoggerOptions = {
  transports: [new winston.transports.Console()],
  format: winston.format.combine(
    winston.format.json(),
    winston.format.prettyPrint(),
    winston.format.colorize({ all: true }),
  ),
}

if (!process.env.DEBUG) {
  loggerOptions.meta = false
}

const app: express.Application = express()

app.use(express.json())
app.use(jwtCheck)
app.use(cors())
app.use(expressWinston.logger(loggerOptions))

routes.push(new CampaignsRoutes(app))

routes.forEach((route: CommonRoutesConfig) => {
  debugLog(`Routes configured for ${route.getName()}`)
})

// app.use("/api/v1/mass-dm/campaigns", campaignRouter)

export default app
