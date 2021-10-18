import express from 'express'
import debug from 'debug'

import CampaignsService from '../services/campaigns.service'

const log: debug.IDebugger = debug('app:controller:campaigns')

class CampaignsController {
  async all(req: express.Request, res: express.Response) {
    // @ts-ignore
    const user = req.user
    const campaigns = await CampaignsService.userCampaigns(user.sub)

    res
      .status(200)
      .send({
        data: campaigns
      })
  }

  async get(req: express.Request, res: express.Response) {
    // @ts-ignore
    const user = req.user
    const campaign = await CampaignsService.userCampaign(user.sub, req.params.id)

    res
      .status(200)
      .send({
        data: campaign
      })
  }

  async create(req: express.Request, res: express.Response) {
    // @ts-ignore
    const user = req.user

    const id = await CampaignsService.create({ userId: user.sub, ...req.body })

    res
      .status(201)
      .send({
        data: { id }
      })
  }

  async update(req: express.Request, res: express.Response) {
    // @ts-ignore
    const user = req.user

    await CampaignsService.update(user.sub, req.params.id, req.body)

    res
      .status(204)
      .send()
  }

  async delete(req: express.Request, res: express.Response) {
    // @ts-ignore
    const user = req.user

    await CampaignsService.delete(user.sub, req.params.id)

    res
      .status(204)
      .send()
  }
}

export default new CampaignsController()
