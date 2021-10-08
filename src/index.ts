/**
 * Required External Modules
 */

import express from 'express'
import jwt from 'express-jwt'
import jwks from 'jwks-rsa'
import cors from 'cors'

require("dotenv").config()

import massDMRouter from "./routers/MassDM"

/**
 * App Variables
 */

const app = express()
const port = process.env.PORT

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

app.use(express.urlencoded())
app.use(jwtCheck)
app.use(cors())

/**
 * Routes Definitions
 */

app.use("/api/v1/mass-dm", massDMRouter)

/**
 * Server Activation
 */

app.listen(port, () => {
  console.log(`Listening to requests on http://localhost:${port}`)
})
