import debug from 'debug'
import {map} from 'lodash'

import {CreateCampaignDto} from '../dto/create.campaign.dto'
import {CampaignDto} from '../dto/campaign.dto'
import {UpdateCampaignDto} from '../dto/update.campaign.dto'
import CampaignsMapper from '../campaigns.mapper'
import database from '../../database'

const log: debug.IDebugger = debug('app:daos:campaigns')

const tableName = 'campaigns'

class CampaignsDao {
  campaigns: Array<CampaignDto> = []

  constructor() {
    log(`Created new instance of CampaignsDao`)
  }

  async find(query: any, limit?: number): Promise<Array<CampaignDto>> {
    log(`Finding Campaigns:`, query, limit)

    let campaigns
    if (limit !== undefined) {
      campaigns = await database(tableName).where(query).limit(limit!)
    } else {
      campaigns = await database(tableName).where(query)
    }

    return map(
      campaigns,
      CampaignsMapper.databaseToDto
    )
  }

  async create(campaign: CreateCampaignDto): Promise<string> {
    log(`Creating Campaign:`, campaign)

    const ids = await database(tableName).insert(
      CampaignsMapper.createDtoToDatabase(campaign),
      'id'
    )

    log(`Campaign created successfully: ${ids[0]}`)

    return ids[0]
  }

  async update(query: any, campaign: UpdateCampaignDto): Promise<void> {
    log(`Updating Campaigns:`, query, campaign)

    await database(tableName)
      .where(query)
      .update(CampaignsMapper.updateDtoToDatabase(campaign))
  }

  async delete(query: any): Promise<void> {
    log(`Deleting Campaigns:`, query)

    await database(tableName).where(query).del()
  }
}

export default new CampaignsDao()
