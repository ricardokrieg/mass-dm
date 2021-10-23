// @ts-ignore
import request from 'supertest'
import test from 'ava'
const chance = require('chance').Chance()
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

  let id;

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
    .get(`/campaigns/${campaigns[0].id}`)

  t.is(res.status, 401)
})

test.serial('fails with error code 404 when trying to access campaign from other user', async t => {
  const res = await request(app)
    .get(`/campaigns/${campaigns[1].id}`)
    .auth(auth.token.access_token, { type: 'bearer' })

  t.is(res.status, 404)
  t.is(res.body.error, `Campaign not found`)
})

test.serial('fails with error code 404 when trying to access nonexistent campaign', async t => {
  const res = await request(app)
    .get(`/campaigns/${chance.guid()}`)
    .auth(auth.token.access_token, { type: 'bearer' })

  t.is(res.status, 404)
  t.is(res.body.error, `Campaign not found`)
})

test.serial.only('fails with error code 404 when passing invalid id with invalid format', async t => {
  const res = await request(app)
    .get(`/campaigns/invalid`)
    .auth(auth.token.access_token, { type: 'bearer' })

  t.is(res.status, 404)
  t.is(res.body.error, `Campaign not found`)
})

test.serial('returns given campaign', async t => {
  const res = await request(app)
    .get(`/campaigns/${campaigns[0].id}`)
    .auth(auth.token.access_token, { type: 'bearer' })

  t.is(res.status, 200)
  t.deepEqual(res.body.data, pick(campaigns[0], ['id', 'title']))
})
