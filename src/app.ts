/**
 * Required External Modules
 */

import express from 'express'
import jwt from 'express-jwt'
import jwks from 'jwks-rsa'
import cors from 'cors'

require("dotenv").config()

import campaignRouter from './Campaign/Campaign.router'

/**
 * App Variables
 */

const app = express()

/**
 * JWT Configuration
 */

const jwtCheck = jwt({
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
  }),
  audience: process.env.AUTH0_AUDIENCE,
  issuer: `https://${process.env.AUTH0_DOMAIN}/`,
  algorithms: ['RS256']
})

/**
 *  App Configuration
 */

app.use(express.json())
app.use(jwtCheck)
app.use(cors())

/**
 * Routes Definitions
 */

app.use("/api/v1/mass-dm/campaigns", campaignRouter)

export default app
