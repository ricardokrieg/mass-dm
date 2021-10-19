import request from 'supertest'
import test from 'ava'

import app from '../../app'
import CampaignsDao from '../daos/campaigns.dao'
import CampaignsService from '../services/campaigns.service'
import {getAccessToken, AccessToken} from '../../common/common.test.config'

let auth: AccessToken
const userId = 'auth0|61642dacfe39bb0069231886'

const title = 'Test Campaign'

test.before(async () => {
  auth = await getAccessToken()
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
    .auth(auth.access_token, { type: 'bearer' })
    .send({
      title: ''
    })

  t.is(res.status, 405)
  t.is(res.body.error, `Title should NOT be shorter than 1 characters`)
})

test.serial('fails with error code 405 when trying to create campaign with invalid input', async t => {
  const res = await request(app)
    .post(`/campaigns`)
    .auth(auth.access_token, { type: 'bearer' })
    .send({
      foo: 'bar'
    })

  t.is(res.status, 405)
  t.is(res.body.error, `should have required property \'title\'`)
})

test.serial('creates campaign', async t => {
  const res = await request(app)
    .post(`/campaigns`)
    .auth(auth.access_token, { type: 'bearer' })
    .send({
      title
    })

  t.is(res.status, 201)

  const campaigns = await CampaignsService.userCampaigns(userId)

  t.deepEqual(res.body.data, { id: campaigns[0].id })
  t.is(campaigns[0].userId, userId)
  t.is(campaigns[0].title, title)
})
