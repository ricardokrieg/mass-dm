import request from 'supertest'

import app from '../../app'
import CampaignsDao from '../daos/campaigns.dao'

const auth = {
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkNqRVRvTFd5aTlQcl9MNWt2SmVoMCJ9.eyJodHRwczovL21hcmtldC1hZ2VuY3kvbmFtZSI6InN1cGVydGVzdEBleGFtcGxlLmNvbSIsImh0dHBzOi8vbWFya2V0LWFnZW5jeS9lbWFpbCI6InN1cGVydGVzdEBleGFtcGxlLmNvbSIsImh0dHBzOi8vbWFya2V0LWFnZW5jeS91c2VyX2lkIjoiYXV0aDB8NjE2NDJkYWNmZTM5YmIwMDY5MjMxODg2IiwiaHR0cHM6Ly9tYXJrZXQtYWdlbmN5L25pY2tuYW1lIjoic3VwZXJ0ZXN0IiwiaHR0cHM6Ly9tYXJrZXQtYWdlbmN5L3BpY3R1cmUiOiJodHRwczovL3MuZ3JhdmF0YXIuY29tL2F2YXRhci83YmRhOTQwYWExYzUyYjQ3MmIyYWRkNjE5NmE5MTEyZT9zPTQ4MCZyPXBnJmQ9aHR0cHMlM0ElMkYlMkZjZG4uYXV0aDAuY29tJTJGYXZhdGFycyUyRnN1LnBuZyIsImlzcyI6Imh0dHBzOi8vZGV2LXk2eDJlczN4LnVzLmF1dGgwLmNvbS8iLCJzdWIiOiJhdXRoMHw2MTY0MmRhY2ZlMzliYjAwNjkyMzE4ODYiLCJhdWQiOiJtYXJrZXRpbmctYWdlbmN5IiwiaWF0IjoxNjM0NDc2MzU4LCJleHAiOjE2MzQ1NjI3NTgsImF6cCI6InRSUklSVzlBV3pTRE53djZDWVlUWnE1Vjc5RVZ1UnBQIn0.HerNo8uvdy4Kn-6ITt1riJO6NpbLSQn66NjSjC-Vz0iFWRn-_0nXE04AZ1yzIvs14R7ia5GxR3AQ0TM96a7Rymck6gjBOWnbOu0__1yw61vm7359tJyIxVc7ffta0wlU1aW6lEc_gbMBHUxjew01xWYknjxk4uJcMvUBwaWJgVAAbEDwY1rd53jwyZsVTT_jMgwkYHI6Qg6aBQl2Gy4Z21v58vHkUjAOI3L5ukKWgifj0krTJhi6TfsljVX20i_tY9NcnCshsVheOlhBN0U8Yy-5mAatKvHRl6PRwmDeTSBEHAOaFsb7cUaUsp4Om9VIdPYfhQVtGyLgMbaBXzKehg",
  "expires_in": 86400,
  "token_type": "Bearer"
}
const userId = 'auth0|61642dacfe39bb0069231886'

const title = 'Test Campaign'

describe('Campaigns test', () => {
  describe('POST /campaigns', () => {
    afterAll(async () => {
      await CampaignsDao.deleteAll()
    })

    it('fails with error code 401 without access token', async () => {
      return request(app)
        .post(`/campaigns`)
        .expect(401)
    })

    it('fails with error code 400 when trying to create campaign without title', async () => {
      return request(app)
        .post(`/campaigns`)
        .auth(auth.access_token, { type: 'bearer' })
        .send({
          title: ''
        })
        .expect(400)
        .then((res) => {
          expect(res.body.error).toEqual(`Missing param: title`)
        })
    })

    it('creates campaign', async () => {
      return request(app)
        .post(`/campaigns`)
        .auth(auth.access_token, { type: 'bearer' })
        .send({
          title
        })
        .expect(201)
        .then(async (res) => {
          const campaigns = await CampaignsDao.getCampaigns(userId)

          expect(res.body.data).toEqual({ uuid: campaigns[0].uuid })
          expect(campaigns[0].userId).toEqual(userId)
          expect(campaigns[0].title).toEqual(title)
        })
    })
  })
})
