import express from "express"
const router = express.Router()

import {default as CampaignRouter} from './Campaign'

router.use('/campaigns', CampaignRouter)

export default router
