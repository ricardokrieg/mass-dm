// @ts-ignore
import request from 'supertest'
import test from 'ava'
import {pick} from 'lodash'

import app from '../../src/app'
import CampaignsDao from '../../src/campaigns/daos/campaigns.dao'
import {CampaignDto} from '../../src/campaigns/dto/campaign.dto'
import {getAuthorization, Authorization} from '../../src/common/common.test.config'

let auth: Authorization
const otherUserId = 'test|61642dacfe39bb0069231886'

const title = 'Test Campaign'
let campaigns: Array<CampaignDto> = []

test.before(async () => {
  auth = await getAuthorization()

  await CampaignsDao.delete({})

  let id;

  id = await CampaignsDao.create({ userId: auth.userId, title })
  campaigns.push({ id, userId: auth.userId, title })

  id = await CampaignsDao.create({ userId: auth.userId, title })
  campaigns.push({ id, userId: auth.userId, title })

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
    .auth(auth.token.access_token, { type: 'bearer' })

  t.is(res.status, 200)
  t.is(res.body.data.length, 2)
  t.deepEqual(res.body.data[0], pick(campaigns[0], ['id', 'title']))
  t.deepEqual(res.body.data[1], pick(campaigns[1], ['id', 'title']))
})
