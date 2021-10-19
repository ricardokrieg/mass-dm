import express from 'express'
import jwt, {UnauthorizedError} from 'express-jwt'
import jwks from 'jwks-rsa'
import cors from 'cors'
import * as winston from 'winston'
import * as expressWinston from 'express-winston'
import debug from 'debug'
const validator = require('swagger-express-validator')
import util from 'util'
import {capitalize} from 'lodash'

import {default as config} from './config'
import {CampaignsRoutes} from './campaigns/campaigns.routes'
import {CommonRoutesConfig} from './common/common.routes.config'

const schema = require('../swagger.json')

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

const swaggerValidatorOpts = {
  schema,
  preserveResponseContentType: false, // Do not override responses for validation errors to always be JSON, default is true
  returnRequestErrors: true, // Include list of request validation errors with response, default is false
  returnResponseErrors: true, // Include list of response validation errors with response, default is false
  validateRequest: true,
  validateResponse: true,
  requestValidationFn: (req: any, data: any, errors: any) => {
    console.log(`failed request validation: ${req.method} ${req.originalUrl}\n ${util.inspect(errors)}`)
    throw errors[0]
  },
  responseValidationFn: (req: any, data: any, errors: any) => {
    console.log(`failed response validation: ${req.method} ${req.originalUrl}\n ${util.inspect(errors)}`)
    throw errors[0]
  },
}

const app: express.Application = express()

app.use(express.json())
app.use(jwtCheck)
app.use(cors())
app.use(expressWinston.logger(loggerOptions))
app.use(validator(swaggerValidatorOpts))

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof UnauthorizedError) {
    res.status(401).json({ error: `Unauthorized` })
  } else if (err.keyword && err.schemaPath) {
    // swagger validation error
    let errorMessage = err.dataPath.startsWith('.') ? capitalize(err.dataPath.slice(1)) + ' ' : ''
    errorMessage += err.message

    res.status(405).json({ error: errorMessage })
  } else {
    res.status(500).json(err)
  }
})

routes.push(new CampaignsRoutes(app))

routes.forEach((route: CommonRoutesConfig) => {
  debugLog(`Routes configured for ${route.getName()}`)
})

export default app
