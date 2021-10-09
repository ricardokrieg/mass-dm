const debug = require('debug')('mkt:services:campaign:playground')

import {list} from './CampaignService'


(async () => {
  const campaigns = await list({ userId: 'auth0|612562e57836e80069e25639' })
  debug(campaigns)

  process.exit(0)
})()
