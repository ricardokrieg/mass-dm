import express from "express"
const router = express.Router()
const debug = require('debug')('mkt:routers:mass-dm')

import * as CampaignService from './Campaign.service'

router.post("/", async (req, res, _next) => {
  // @ts-ignore
  const user = req.user

  const campaign = await CampaignService.create({ userId: user.sub, title: req.body.title, messageSpintax: req.body.messageSpintax })

  res.json({
    data: campaign,
  })
})

router.get('/', async (req, res, _next) => {
  // @ts-ignore
  const user = req.user

  const campaigns = await CampaignService.list({ userId: user.sub })

  res.json({
    data: campaigns,
  })
})

router.get("/:uuid", async (req, res, _next) => {
  // @ts-ignore
  const user = req.user

  const campaign = await CampaignService.details({ userId: user.sub, uuid: req.params.uuid })

  res.json({
    data: campaign,
  })
})

export default router
