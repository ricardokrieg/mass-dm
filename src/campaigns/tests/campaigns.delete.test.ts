import request from 'supertest'
import test from 'ava'
const chance = require('chance').Chance()

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

  id = await CampaignsDao.create({ userId: otherUserId, title })
  campaigns.push({ id, userId: otherUserId, title })
})

test.after(async () => {
  await CampaignsDao.delete({})
})

test.serial('fails with error code 401 without access token', async t => {
  const res = await request(app)
    .delete(`/campaigns/${campaigns[0].id}`)

  t.is(res.status, 401)
})

test.serial('fails with error code 404 when trying to delete campaign from other user', async t => {
  const res = await request(app)
    .delete(`/campaigns/${campaigns[1].id}`)
    .auth(auth.access_token, { type: 'bearer' })

  t.is(res.status, 404)
  t.is(res.body.error, `Campaign not found`)
})

test.serial('fails with error code 404 when trying to delete nonexistent campaign', async t => {
  const res = await request(app)
    .delete(`/campaigns/${chance.guid()}`)
    .auth(auth.access_token, { type: 'bearer' })

  t.is(res.status, 404)
  t.is(res.body.error, `Campaign not found`)
})

test.serial('deletes given campaign', async t => {
  const res = await request(app)
    .delete(`/campaigns/${campaigns[0].id}`)
    .auth(auth.access_token, { type: 'bearer' })

  t.is(res.status, 204)
  t.deepEqual(await CampaignsDao.find({ id: campaigns[0].id, user_id: userId }, 1), [])
})
