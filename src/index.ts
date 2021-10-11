/**
 * Required External Modules
 */

import app from './app'

const port = process.env.PORT

/**
 * Server Activation
 */

app.listen(port, () => {
  console.log(`Listening to requests on http://localhost:${port}`)
})

export default app
