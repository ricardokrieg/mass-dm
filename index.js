/**
 * Required External Modules
 */

const express = require("express")
const jwt = require('express-jwt')
const jwks = require('jwks-rsa')
const path = require("path")

const expressSession = require("express-session")
const passport = require("passport")
const Auth0Strategy = require("passport-auth0")

require("dotenv").config()

const authRouter = require("./routers/auth")
const massDMRouter = require("./routers/mass-dm")

/**
 * App Variables
 */

const app = express()
const port = process.env.PORT || "8000"

/**
 * Session Configuration
 */

const session = {
  secret: process.env.SESSION_SECRET,
  cookie: {},
  resave: false,
  saveUninitialized: false
}

if (app.get("env") === "production") {
  // Serve secure cookies, requires HTTPS
  session.cookie.secure = true
}

/**
 * JWT Configuration
 */

const jwtCheck = jwt({
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: 'https://dev-y6x2es3x.us.auth0.com/.well-known/jwks.json'
  }),
  audience: 'marketing-agency',
  issuer: 'https://dev-y6x2es3x.us.auth0.com/',
  algorithms: ['RS256']
})

/**
 * Passport Configuration
 */

const strategy = new Auth0Strategy(
  {
    domain: process.env.AUTH0_DOMAIN,
    clientID: process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
    callbackURL: process.env.AUTH0_CALLBACK_URL
  },
  function(accessToken, refreshToken, extraParams, profile, done) {
    /**
     * Access tokens are used to authorize users to an API
     * (resource server)
     * accessToken is the token to call the Auth0 API
     * or a secured third-party API
     * extraParams.id_token has the JSON Web Token
     * profile has all the information from the user
     */
    return done(null, profile)
  }
)

/**
 *  App Configuration
 */

app.set("views", path.join(__dirname, "views"))
app.set("view engine", "pug")
app.use(express.static(path.join(__dirname, "public")))
app.use(express.urlencoded())

app.use(expressSession(session))

app.use(jwtCheck)

passport.use(strategy)
app.use(passport.initialize())
app.use(passport.session())

passport.serializeUser((user, done) => {
  done(null, user)
})

passport.deserializeUser((user, done) => {
  done(null, user)
})

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.isAuthenticated()

  if (req.isAuthenticated()) {
    const { _raw, _json, ...userProfile } = req.user
    res.locals.userProfile = userProfile
  } else {
    res.locals.userProfile = {}
  }

  next()
})

/**
 * Routes Definitions
 */

const secured = (req, res, next) => {
  if (req.user) {
    return next()
  }
  req.session.returnTo = req.originalUrl
  res.redirect("/login")
}

app.use("/", authRouter)
app.use("/mass-dm", secured, massDMRouter)

app.get("/", secured, (req, res) => {
  res.render("index", {
    title: "Overview",
    currentPage: "overview"
  })
})

app.get("/user", secured, (req, res, _next) => {
  res.render("auth/user", {
    title: "Profile"
  })
})

app.get("/foo", (req, res, _next) => {
  res.json({ status: 'OK' })
})

/**
 * Server Activation
 */

app.listen(port, () => {
  console.log(`Listening to requests on http://localhost:${port}`)
})
