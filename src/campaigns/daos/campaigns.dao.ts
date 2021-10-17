import debug from 'debug'
import {find, findIndex, filter} from 'lodash'
const chance = require('chance').Chance()

import {CreateCampaignDto} from '../dto/create.campaign.dto'
import {CampaignDto} from '../dto/campaign.dto'
import {UpdateCampaignDto} from '../dto/update.campaign.dto'
import {CampaignNotFoundError} from "../campaigns.errors";

const log: debug.IDebugger = debug('app:daos:campaigns')

class CampaignsDao {
  campaigns: Array<CampaignDto> = []

  constructor() {
    log(`Created new instance of CampaignsDao`)
  }

  async addCampaign(createCampaign: CreateCampaignDto): Promise<CampaignDto> {
    const campaign: CampaignDto = {
      uuid: chance.guid(),
      ...createCampaign,
    }

    this.campaigns.push(campaign)

    return campaign
  }

  async getCampaigns(): Promise<Array<CampaignDto>> {
    return this.campaigns
  }

  async getCampaignByUuid(uuid: string): Promise<CampaignDto | undefined> {
    return find(this.campaigns, { uuid })
  }

  async updateCampaign(oldCampaign: CampaignDto, newCampaign: UpdateCampaignDto): Promise<CampaignDto> {
    const campaignIndex = findIndex(this.campaigns, { uuid: oldCampaign.uuid })
    if (campaignIndex < 0) {
      return
    }

    const campaign = {
      ...oldCampaign,
      ...newCampaign,
    }

    this.campaigns.splice(campaignIndex, 1, campaign)

    return campaign
  }

  async deleteCampaignByUuid(userId: string, uuid: string): Promise<void> {
    const campaignIndex = findIndex(this.campaigns, { userId, uuid })
    if (campaignIndex < 0) {
      throw new CampaignNotFoundError()
    }

    this.campaigns.splice(campaignIndex, 1)
  }

  async deleteAll(): Promise<void> {
    this.campaigns.splice(0)
  }
}

export default new CampaignsDao()
