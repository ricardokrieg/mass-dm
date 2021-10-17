const debug = require('debug')('mkt:services:campaign:playground')

import {CampaignStatus, ICreateParams, IDetailsParams, IListParams} from "./interfaces"
import * as CampaignService from './Campaign.service'

const userId = 'auth0|61642dacfe39bb0069231886'

const create = async () => {
  const params: ICreateParams = {
    userId,
    title: 'Test Campaign',
    messageSpintax: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  }
  const campaign = await CampaignService.create(params)
  debug(campaign)
}

const list = async () => {
  const params: IListParams = {
    userId,
    status: CampaignStatus.Draft,
  }
  const campaigns = await CampaignService.list(params)
  debug(campaigns)
}

const details = async () => {
  const params: IDetailsParams = {
    userId,
    uuid: '46247d76-26e3-521f-a57c-0dc9062591b3',
  }
  const campaigns = await CampaignService.details(params)
  debug(campaigns)
}

(async () => {
  await create()
  // await list()
  // await details()

  process.exit(0)
})()
