import express from 'express'
import debug from 'debug'

import CampaignsService from '../services/campaigns.service'
import {CampaignNotFoundError} from '../campaigns.errors'

const log: debug.IDebugger = debug('app:controller:campaigns')

class CampaignsController {
  async list(req: express.Request, res: express.Response) {
    // @ts-ignore
    const user = req.user
    const campaigns = await CampaignsService.list(user.sub, 100, 0)
    res
      .status(200)
      .send({
        data: campaigns
      })
  }

  async get(req: express.Request, res: express.Response) {
    // @ts-ignore
    const user = req.user

    const campaign = await CampaignsService.get(user.sub, req.params.uuid)

    if (campaign === undefined) {
      res
        .status(404)
        .send({
          error: `Campaign not found`
        })
    } else {
      res
        .status(200)
        .send({
          data: campaign
        })
    }
  }

  async create(req: express.Request, res: express.Response) {
    // @ts-ignore
    const user = req.user

    const campaign = await CampaignsService.create({ userId: user.sub, ...req.body })

    res
      .status(201)
      .send({
        data: { uuid: campaign.uuid }
      })
  }

  async update(req: express.Request, res: express.Response) {
    // @ts-ignore
    const user = req.user

    try {
      await CampaignsService.update(user.sub, req.body.uuid, req.body)
    } catch (error) {
      if (error instanceof CampaignNotFoundError) {
        res
          .status(404)
          .send({
            error: `Campaign not found`
          })

        return
      } else {
        throw error
      }
    }

    res
      .status(204)
      .send()
  }

  async delete(req: express.Request, res: express.Response) {
    // @ts-ignore
    const user = req.user

    try {
      await CampaignsService.delete(user.sub, req.params.uuid)
    } catch (error) {
      if (error instanceof CampaignNotFoundError) {
        res
          .status(404)
          .send({
            error: `Campaign not found`
          })

        return
      } else {
        throw error
      }
    }

    res
      .status(204)
      .send()
  }
}

export default new CampaignsController()
