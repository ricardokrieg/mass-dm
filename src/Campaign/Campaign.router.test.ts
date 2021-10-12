import request from 'supertest'
import {map, isEqual, sortBy} from 'lodash'

import app from '../app'
import {ICampaign} from './interfaces'
import * as CampaignService from './Campaign.service'

const auth = {
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkNqRVRvTFd5aTlQcl9MNWt2SmVoMCJ9.eyJodHRwczovL21hcmtldC1hZ2VuY3kvbmFtZSI6InN1cGVydGVzdEBleGFtcGxlLmNvbSIsImh0dHBzOi8vbWFya2V0LWFnZW5jeS9lbWFpbCI6InN1cGVydGVzdEBleGFtcGxlLmNvbSIsImh0dHBzOi8vbWFya2V0LWFnZW5jeS91c2VyX2lkIjoiYXV0aDB8NjE2NDJkYWNmZTM5YmIwMDY5MjMxODg2IiwiaHR0cHM6Ly9tYXJrZXQtYWdlbmN5L25pY2tuYW1lIjoic3VwZXJ0ZXN0IiwiaHR0cHM6Ly9tYXJrZXQtYWdlbmN5L3BpY3R1cmUiOiJodHRwczovL3MuZ3JhdmF0YXIuY29tL2F2YXRhci83YmRhOTQwYWExYzUyYjQ3MmIyYWRkNjE5NmE5MTEyZT9zPTQ4MCZyPXBnJmQ9aHR0cHMlM0ElMkYlMkZjZG4uYXV0aDAuY29tJTJGYXZhdGFycyUyRnN1LnBuZyIsImlzcyI6Imh0dHBzOi8vZGV2LXk2eDJlczN4LnVzLmF1dGgwLmNvbS8iLCJzdWIiOiJhdXRoMHw2MTY0MmRhY2ZlMzliYjAwNjkyMzE4ODYiLCJhdWQiOiJtYXJrZXRpbmctYWdlbmN5IiwiaWF0IjoxNjMzOTU3MDk1LCJleHAiOjE2MzQwNDM0OTUsImF6cCI6InRSUklSVzlBV3pTRE53djZDWVlUWnE1Vjc5RVZ1UnBQIn0.rVnsdXbjI19l5wDoRbgnT4srafdOv8FjGRwbuGzLrb2cJY1g88udaIxCWBMGBVygskESbDAcCaNYSm9RkUBe9QLEOCDTh9BssjDucc_li5-19NW0K88pMv-kZvrv3-FGxz7_aiY4Paiu_ZgWrRiUg4OuV531SXz-Ti7oRU1FolsG75ar2ACUt3q0IY_WXbIhiS7aKDz0HBWZ3ecWNANprvL6zsio-Mq_B66qNUFzsfBkRvYfuwUrmLl64o2emouR8SPO0PeuXyp54pXR8S9xL22r5Jo9bm5vlDu8H7Cwzb0vuOl-xAI05K9DC1FXisQ5m7bBJx6zSx5hz-AncTtfxw",
  "expires_in": 86400,
  "token_type": "Bearer",
}
const userId = 'auth0|61642dacfe39bb0069231886'

let campaigns: ICampaign[]

describe('Campaign router', () => {
  beforeAll(async () => {
    campaigns = await CampaignService.list({ userId })
  })

  describe('POST /campaigns', () => {
    const url = '/api/v1/mass-dm/campaigns'

    it('should fail without access token', async () => {
      return request(app)
        .post(url)
        .expect(401)
    })

    it('should success with access token', async () => {
      return request(app)
        .post(url)
        .auth(auth.access_token, { type: 'bearer' })
        .send({
          title: 'Test Campaign',
          messageSpintax: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        })
        .expect(200)
        .then((response) => {
          expect(response.type).toBe('application/json')

          campaigns = [...campaigns, response.body.data]
        })
    })
  })

  describe('GET /campaigns', () => {
    const url = '/api/v1/mass-dm/campaigns'

    it('should fail without access token', async () => {
      return request(app)
        .get(url)
        .expect(401)
    })

    it('should success with access token', async () => {
      return request(app)
        .get(url)
        .auth(auth.access_token, { type: 'bearer' })
        .expect(200)
        .then((response) => {
          expect(response.type).toBe('application/json')

          expect(isEqual(sortBy(map(response.body.data, 'uuid')), sortBy(map(campaigns, 'uuid')))).toBeTruthy()
        })
    })
  })

  describe('GET /campaigns/:id', () => {
    let campaignId: string
    let url: string

    beforeAll(async () => {
      campaignId = campaigns[0].uuid
      url = `/api/v1/mass-dm/campaigns/${campaignId}`
    })

    it('should fail without access token', async () => {
      return request(app)
        .get(url)
        .expect(401)
    })

    it('should success with access token', async () => {
      return request(app)
        .get(url)
        .auth(auth.access_token, { type: 'bearer' })
        .expect(200)
        .then((response) => {
          expect(response.type).toBe('application/json')

          expect(response.body.data.uuid).toEqual(campaigns[0].uuid)
        })
    })
  })
})

module.exports = {}
