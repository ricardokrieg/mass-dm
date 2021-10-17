import {CreateCampaignDto} from '../dto/create.campaign.dto'
import {CampaignDto} from '../dto/campaign.dto'
import CampaignsDao from '../daos/campaigns.dao'
import {UpdateCampaignDto} from "../dto/update.campaign.dto";

class CampaignsService {
  list(userId: string, limit: number, page: number): Promise<Array<CampaignDto>> {
    return CampaignsDao.getCampaigns(userId)
  }

  get(userId: string, uuid: string): Promise<CampaignDto | undefined> {
    return CampaignsDao.getCampaignByUuid(userId, uuid)
  }

  create(resource: CreateCampaignDto): Promise<CampaignDto> {
    return CampaignsDao.addCampaign(resource)
  }

  update(userId: string, uuid: string, resource: UpdateCampaignDto): Promise<CampaignDto | undefined> {
    return CampaignsDao.updateCampaignByUuid(userId, uuid, resource)
  }

  delete(userId: string, uuid: string): Promise<void> {
    return CampaignsDao.deleteCampaignByUuid(userId, uuid)
  }
}

export default new CampaignsService()
