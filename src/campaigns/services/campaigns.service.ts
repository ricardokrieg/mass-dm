import { isEmpty } from 'lodash'

import {CreateCampaignDto} from '../dto/create.campaign.dto'
import {CampaignDto} from '../dto/campaign.dto'
import CampaignsDao from '../daos/campaigns.dao'
import {UpdateCampaignDto} from '../dto/update.campaign.dto'
import {CampaignNotFoundError} from '../campaigns.errors'

class CampaignsService {
  async userCampaigns(userId: string): Promise<Array<CampaignDto>> {
    return CampaignsDao.find({ user_id: userId })
  }

  async userCampaign(userId: string, id: string): Promise<CampaignDto> {
    const campaigns = await CampaignsDao.find({ id, user_id: userId }, 1)

    if (isEmpty(campaigns)) {
      throw new CampaignNotFoundError()
    }

    return campaigns[0]
  }

  async create(campaign: CreateCampaignDto): Promise<string> {
    return CampaignsDao.create(campaign)
  }

  async update(userId: string, id: string, campaign: UpdateCampaignDto): Promise<void> {
    return CampaignsDao.update({ id, user_id: userId }, campaign)
  }

  async delete(userId: string, id: string): Promise<void> {
    return CampaignsDao.delete({ id, user_id: userId })
  }
}

export default new CampaignsService()
