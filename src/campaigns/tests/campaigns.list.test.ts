import request from 'supertest'
import test from 'ava'

import app from '../../app'
import CampaignsDao from '../daos/campaigns.dao'
import {CampaignDto} from '../dto/campaign.dto'
import {getAccessToken, AccessToken} from '../../common/common.test.config'

let auth: AccessToken
const userId = 'auth0|61642dacfe39bb0069231886'
const otherUserId = 'test|61642dacfe39bb0069231886'

const title = 'Test Campaign'
let campaigns: Array<CampaignDto> = []

test.before(async () => {
  auth = await getAccessToken()

  await CampaignsDao.delete({})

  let id;

  id = await CampaignsDao.create({ userId, title })
  campaigns.push({ id, userId, title })

  id = await CampaignsDao.create({ userId, title })
  campaigns.push({ id, userId, title })

  id = await CampaignsDao.create({ userId: otherUserId, title })
  campaigns.push({ id, userId: otherUserId, title })
})

test.after(async () => {
  await CampaignsDao.delete({})
})

test.serial('fails with error code 401 without access token', async t => {
  const res = await request(app)
    .get('/campaigns')

  t.is(res.status, 401)
})

test.serial('returns user campaigns', async t => {
  const res = await request(app)
    .get('/campaigns')
    .auth(auth.access_token, { type: 'bearer' })

  t.is(res.status, 200)
  t.is(res.body.data.length, 2)
  t.deepEqual(res.body.data[0], campaigns[0])
  t.deepEqual(res.body.data[1], campaigns[1])
})
