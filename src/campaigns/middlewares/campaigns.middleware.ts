import express from 'express'
import debug from 'debug'
import {isEmpty, get, set} from 'lodash'

import CampaignsService from '../services/campaigns.service'
import {CampaignNotFoundError} from '../campaigns.errors'

const log: debug.IDebugger = debug("app:middleware:campaigns")

class CampaignsMiddleware {
  async validateCreate(req: express.Request, res: express.Response, next: express.NextFunction) {
    if (isEmpty(get(req, 'body.title'))) {
      res.status(400).send({ error: `Missing param: title` })
      return
    } else {
      next()
    }
  }

  async validateUpdate(req: express.Request, res: express.Response, next: express.NextFunction) {
    if (isEmpty(get(req, 'body.title'))) {
      res.status(400).send({ error: `Missing param: title` })
    } else {
      next()
    }
  }

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
