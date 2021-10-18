import {CreateCampaignDto} from './dto/create.campaign.dto'
import {CampaignDto} from './dto/campaign.dto'
import {UpdateCampaignDto} from './dto/update.campaign.dto'

class CampaignsMapper {
  createDtoToDatabase(campaign: CreateCampaignDto): any {
    return {
      user_id: campaign.userId,
      title: campaign.title,
    }
  }

  updateDtoToDatabase(campaign: UpdateCampaignDto): any {
    return {
      title: campaign.title,
    }
  }

  databaseToDto(row: any): CampaignDto {
    return {
      id: row['id'],
      userId: row['user_id'],
      title: row['title'],
    }
  }
}

export default new CampaignsMapper()
