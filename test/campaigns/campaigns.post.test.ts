// @ts-ignore
import request from 'supertest'
import test from 'ava'

import app from '../../src/app'
import CampaignsDao from '../../src/campaigns/daos/campaigns.dao'
import CampaignsService from '../../src/campaigns/services/campaigns.service'
import {getAuthorization, Authorization} from '../../src/common/common.test.config'

let auth: Authorization

const title = 'Test Campaign'

test.before(async () => {
  auth = await getAuthorization()

  await CampaignsDao.delete({})
})

test.after(async () => {
  await CampaignsDao.delete({})
})

test.serial('fails with error code 401 without access token', async t => {
  const res = await request(app)
    .post(`/campaigns`)

  t.is(res.status, 401)
})

test.serial('fails with error code 405 when trying to create campaign without title', async t => {
  const res = await request(app)
    .post(`/campaigns`)
    .auth(auth.token.access_token, { type: 'bearer' })
    .send({
      title: ''
    })

  t.is(res.status, 405)
  t.is(res.body.error, `Title should NOT be shorter than 1 characters`)
})

test.serial('fails with error code 405 when trying to create campaign with invalid input', async t => {
  const res = await request(app)
    .post(`/campaigns`)
    .auth(auth.token.access_token, { type: 'bearer' })
    .send({
      foo: 'bar'
    })

  t.is(res.status, 405)
  t.is(res.body.error, `should have required property \'title\'`)
})

test.serial('creates campaign', async t => {
  const res = await request(app)
    .post(`/campaigns`)
    .auth(auth.token.access_token, { type: 'bearer' })
    .send({
      title
    })

  t.is(res.status, 201)

  const campaigns = await CampaignsService.userCampaigns(auth.userId)

  t.deepEqual(res.body.data, { id: campaigns[0].id })
  t.is(campaigns[0].userId, auth.userId)
  t.is(campaigns[0].title, title)
})
