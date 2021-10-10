const debug = require('debug')('mkt:services:campaign:playground')

import {CampaignStatus, ICreateParams, IDetailsParams, IListParams} from "./interfaces"
import * as CampaignService from './CampaignService'

const create = async () => {
  const params: ICreateParams = {
    userId: '1',
    title: 'Test 1',
    messageSpintax: 'This is my message',
  }
  const campaign = await CampaignService.create(params)
  debug(campaign)
}

const list = async () => {
  const params: IListParams = {
    userId: '1',
    status: CampaignStatus.Draft,
  }
  const campaigns = await CampaignService.list(params)
  debug(campaigns)
}

const details = async () => {
  const params: IDetailsParams = {
    userId: '1',
    uuid: '46247d76-26e3-521f-a57c-0dc9062591b3',
  }
  const campaigns = await CampaignService.details(params)
  debug(campaigns)
}

(async () => {
  // await create()
  // await list()
  await details()

  process.exit(0)
})()
