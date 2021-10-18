import request from 'supertest'
import test from 'ava'
const chance = require('chance').Chance()

import app from '../../app'
import CampaignsDao from '../daos/campaigns.dao'
import CampaignsService from '../services/campaigns.service'
import {CampaignDto} from '../dto/campaign.dto'

const auth = {
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkNqRVRvTFd5aTlQcl9MNWt2SmVoMCJ9.eyJodHRwczovL21hcmtldC1hZ2VuY3kvbmFtZSI6InN1cGVydGVzdEBleGFtcGxlLmNvbSIsImh0dHBzOi8vbWFya2V0LWFnZW5jeS9lbWFpbCI6InN1cGVydGVzdEBleGFtcGxlLmNvbSIsImh0dHBzOi8vbWFya2V0LWFnZW5jeS91c2VyX2lkIjoiYXV0aDB8NjE2NDJkYWNmZTM5YmIwMDY5MjMxODg2IiwiaHR0cHM6Ly9tYXJrZXQtYWdlbmN5L25pY2tuYW1lIjoic3VwZXJ0ZXN0IiwiaHR0cHM6Ly9tYXJrZXQtYWdlbmN5L3BpY3R1cmUiOiJodHRwczovL3MuZ3JhdmF0YXIuY29tL2F2YXRhci83YmRhOTQwYWExYzUyYjQ3MmIyYWRkNjE5NmE5MTEyZT9zPTQ4MCZyPXBnJmQ9aHR0cHMlM0ElMkYlMkZjZG4uYXV0aDAuY29tJTJGYXZhdGFycyUyRnN1LnBuZyIsImlzcyI6Imh0dHBzOi8vZGV2LXk2eDJlczN4LnVzLmF1dGgwLmNvbS8iLCJzdWIiOiJhdXRoMHw2MTY0MmRhY2ZlMzliYjAwNjkyMzE4ODYiLCJhdWQiOiJtYXJrZXRpbmctYWdlbmN5IiwiaWF0IjoxNjM0NDc2MzU4LCJleHAiOjE2MzQ1NjI3NTgsImF6cCI6InRSUklSVzlBV3pTRE53djZDWVlUWnE1Vjc5RVZ1UnBQIn0.HerNo8uvdy4Kn-6ITt1riJO6NpbLSQn66NjSjC-Vz0iFWRn-_0nXE04AZ1yzIvs14R7ia5GxR3AQ0TM96a7Rymck6gjBOWnbOu0__1yw61vm7359tJyIxVc7ffta0wlU1aW6lEc_gbMBHUxjew01xWYknjxk4uJcMvUBwaWJgVAAbEDwY1rd53jwyZsVTT_jMgwkYHI6Qg6aBQl2Gy4Z21v58vHkUjAOI3L5ukKWgifj0krTJhi6TfsljVX20i_tY9NcnCshsVheOlhBN0U8Yy-5mAatKvHRl6PRwmDeTSBEHAOaFsb7cUaUsp4Om9VIdPYfhQVtGyLgMbaBXzKehg",
  "expires_in": 86400,
  "token_type": "Bearer"
}
const userId = 'auth0|61642dacfe39bb0069231886'
const otherUserId = 'test|61642dacfe39bb0069231886'

const title = 'Test Campaign'
let campaigns: Array<CampaignDto> = []

test.before(async () => {
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

test.serial('fails with error code 400 when trying to update campaign without title', async t => {
  const res = await request(app)
    .patch(`/campaigns/${campaigns[0].id}`)
    .auth(auth.access_token, { type: 'bearer' })
    .send({
      title: ''
    })

  t.is(res.status, 400)
  t.is(res.body.error, `Missing param: title`)
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
