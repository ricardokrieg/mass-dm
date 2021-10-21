import express from 'express'
import debug from 'debug'
import {set} from 'lodash'

import CampaignsService from '../services/campaigns.service'
import {CampaignNotFoundError} from '../campaigns.errors'

const log: debug.IDebugger = debug("app:middleware:campaigns")

const isValidUuid = (id: string): boolean => {
  const regexExp = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi
  return regexExp.test(id)
}

class CampaignsMiddleware {
  async validateCampaignExists(req: express.Request, res: express.Response, next: express.NextFunction) {
    if (!isValidUuid(req.params.id)) {
      res.status(404).send({ error: `Campaign not found` })
      return
    }

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
        console.error(error)
        res.status(500).send({ error: `Internal server error` })
      }
    }
  }
}

export default new CampaignsMiddleware()
