// @ts-ignore
import request from 'supertest'
import test from 'ava'
const chance = require('chance').Chance()

import app from '../../src/app'
import CampaignsDao from '../../src/campaigns/daos/campaigns.dao'
import CampaignsService from '../../src/campaigns/services/campaigns.service'
import {CampaignDto} from '../../src/campaigns/dto/campaign.dto'
import {getAccessToken, AccessToken} from '../../src/common/common.test.config'

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
    .patch(`/campaigns/${campaigns[0].id}`)

  t.is(res.status, 401)
})

test.serial('fails with error code 404 when trying to update campaign from other user', async t => {
  const res = await request(app)
    .patch(`/campaigns/${campaigns[1].id}`)
    .auth(auth.access_token, { type: 'bearer' })
    .send({
      title
    })

  t.is(res.status, 404)
  t.is(res.body.error, `Campaign not found`)
})

test.serial('fails with error code 404 when trying to update a nonexistent campaign', async t => {
  const res = await request(app)
    .patch(`/campaigns/${chance.guid()}`)
    .auth(auth.access_token, { type: 'bearer' })
    .send({
      title
    })

  t.is(res.status, 404)
  t.is(res.body.error, `Campaign not found`)
})

test.serial('fails with error code 405 when trying to update campaign without title', async t => {
  const res = await request(app)
    .patch(`/campaigns/${campaigns[0].id}`)
    .auth(auth.access_token, { type: 'bearer' })
    .send({
      title: ''
    })

  t.is(res.status, 405)
  t.is(res.body.error, `Title should NOT be shorter than 1 characters`)
})

test.serial('fails with error code 405 when trying to update campaign with invalid input', async t => {
  const res = await request(app)
    .patch(`/campaigns/${campaigns[0].id}`)
    .auth(auth.access_token, { type: 'bearer' })
    .send({
      foo: 'bar'
    })

  t.is(res.status, 405)
  t.is(res.body.error, `should have required property \'title\'`)
})

test.serial('updates given campaign', async t => {
  const res = await request(app)
    .patch(`/campaigns/${campaigns[0].id}`)
    .auth(auth.access_token, { type: 'bearer' })
    .send({
      title: `New title`
    })

  t.is(res.status, 204)

  const campaign = await CampaignsService.userCampaign(userId, campaigns[0].id)

  t.is(campaign.title, `New title`)
})
