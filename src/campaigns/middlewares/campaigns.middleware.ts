import express from 'express'
import debug from 'debug'
import {set, isEmpty} from 'lodash'

import CampaignsService from '../services/campaigns.service'
import {CampaignNotFoundError} from '../campaigns.errors'

const log: debug.IDebugger = debug("app:middleware:campaigns")

class CampaignsMiddleware {
  async validateCampaignExists(req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
      // @ts-ignore
      const user = req.user

      log(`validateCampaignExists`, user.sub, req.params.id)

      const campaign = await CampaignsService.userCampaign(user.sub, req.params.id)
      set(req, 'campaign', campaign)

      next()
    } catch (error) {
      if (error instanceof CampaignNotFoundError) {
        res.status(404).send({ error: `Campaign not found` })
      } else {
        throw error
      }
    }
  }
}

export default new CampaignsMiddleware()
