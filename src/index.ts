/**
 * Required External Modules
 */

import {default as config} from './config'
import app from './app'

/**
 * Server Activation
 */

app.listen(config.port, () => {
  console.log(`Listening to requests on http://localhost:${config.port}`)
})

export default app
