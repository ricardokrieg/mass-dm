import express from "express"
const router = express.Router()
const debug = require('debug')('mkt:routers:mass-dm')

import * as CampaignService from './Campaign.service'
import {ICampaign} from "./interfaces";
import {NotFoundError, MissingParamError} from "./errors";

router.post("/", async (req, res, _next) => {
  // @ts-ignore
  const user = req.user
  let campaign: ICampaign

  try {
    campaign = await CampaignService.create({ userId: user.sub, title: req.body.title, messageSpintax: req.body.messageSpintax })
  } catch (error) {
    if (error instanceof MissingParamError) {
      res
        .status(422)
        .json({ error: error.message })
      return
    } else {
      throw error
    }
  }

  res
    .status(201)
    .json({
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

  let campaign: ICampaign
  try {
    campaign = await CampaignService.details({ userId: user.sub, uuid: req.params.uuid })
  } catch (error) {
    if (error instanceof NotFoundError) {
      res
        .status(404)
        .json({ error: error.message })
      return
    } else {
      throw error
    }
  }

  res.json({
    data: campaign,
  })
})

router.patch("/:uuid", async (req, res, _next) => {
  // @ts-ignore
  const user = req.user

  let campaign: ICampaign
  try {
    // TODO, pass fields to update as IUpdateParams (title, messageSpintax)
    // TODO, fix this thing of only dealing with a single message ... should be an array
    campaign = await CampaignService.update({ userId: user.sub, uuid: req.params.uuid })
  } catch (error) {
    if (error instanceof NotFoundError) {
      res
        .status(404)
        .json({ error: error.message })
      return
    } else {
      throw error
    }
  }

  res.json({
    data: campaign,
  })
})

export default router
