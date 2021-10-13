import request from 'supertest'
import {isEmpty, isEqual, map, sortBy} from 'lodash'
import moment from "moment"
const debug = require('debug')('mkt:test:campaign')

import app from '../app'
import {CampaignStatus, ICampaign} from './interfaces'
import * as CampaignService from './Campaign.service'

moment.locale('en-US')

const auth = {
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkNqRVRvTFd5aTlQcl9MNWt2SmVoMCJ9.eyJodHRwczovL21hcmtldC1hZ2VuY3kvbmFtZSI6InN1cGVydGVzdEBleGFtcGxlLmNvbSIsImh0dHBzOi8vbWFya2V0LWFnZW5jeS9lbWFpbCI6InN1cGVydGVzdEBleGFtcGxlLmNvbSIsImh0dHBzOi8vbWFya2V0LWFnZW5jeS91c2VyX2lkIjoiYXV0aDB8NjE2NDJkYWNmZTM5YmIwMDY5MjMxODg2IiwiaHR0cHM6Ly9tYXJrZXQtYWdlbmN5L25pY2tuYW1lIjoic3VwZXJ0ZXN0IiwiaHR0cHM6Ly9tYXJrZXQtYWdlbmN5L3BpY3R1cmUiOiJodHRwczovL3MuZ3JhdmF0YXIuY29tL2F2YXRhci83YmRhOTQwYWExYzUyYjQ3MmIyYWRkNjE5NmE5MTEyZT9zPTQ4MCZyPXBnJmQ9aHR0cHMlM0ElMkYlMkZjZG4uYXV0aDAuY29tJTJGYXZhdGFycyUyRnN1LnBuZyIsImlzcyI6Imh0dHBzOi8vZGV2LXk2eDJlczN4LnVzLmF1dGgwLmNvbS8iLCJzdWIiOiJhdXRoMHw2MTY0MmRhY2ZlMzliYjAwNjkyMzE4ODYiLCJhdWQiOiJtYXJrZXRpbmctYWdlbmN5IiwiaWF0IjoxNjM0MTY3MTExLCJleHAiOjE2MzQyNTM1MTEsImF6cCI6InRSUklSVzlBV3pTRE53djZDWVlUWnE1Vjc5RVZ1UnBQIn0.Acrd0PV7nKlvKf3C-YSaMzchfoScPgZWgO4gN22kouCoGRPPwG4Jd8-02Y0x2Aa_CNU7nyi0bLY3s2uSIq0lRDeLSZrYaWUvH-myY-fwcdzBc_8GxMGIvWs3_0JXTpOkfKk9OWfkVML4DYReabJcr5gKJuvfy9JxWuwN2uNDEpXrOd43g9JnITen-3k2P_KLT3Zq7KBss0HaeBQC-mgg1uYC1Afp04Mpk9JYMs0SLRKuS68I5E_iweaBO_HMu3I7hU6hAFvo8OUteDxtrANHdL9_4ndhv-fpB5iSjjhocdJ4vgOtdOIoCkbiZrJYS267lqD0sp8KYFUicg5S0-zK-w",
  "expires_in": 86400,
  "token_type": "Bearer"
}
const userId = 'auth0|61642dacfe39bb0069231886'
const otherUserId = 'test|61642dacfe39bb0069231886'

const title = 'Test Campaign'
const messageSpintax = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'

let campaigns: ICampaign[]
let otherCampaigns: ICampaign[]

describe('Campaign integration test', () => {
  beforeAll(async () => {
    campaigns = await CampaignService.list({ userId })
    otherCampaigns = await CampaignService.list({ userId: otherUserId })

    if (isEmpty(campaigns)) {
      const campaign = await CampaignService.create({
        userId,
        title,
        messageSpintax,
      })
      campaigns = [...campaigns, campaign]
    }

    if (isEmpty(otherCampaigns)) {
      const campaign = await CampaignService.create({
        userId: otherUserId,
        title,
        messageSpintax,
      })
      otherCampaigns = [...otherCampaigns, campaign]
    }
  })

  describe('POST /campaigns', () => {
    const url = '/api/v1/mass-dm/campaigns'

    it('fails without access token', async () => {
      return request(app)
        .post(url)
        .expect(401)
    })

    it('succeeds with access token', async () => {
      return request(app)
        .post(url)
        .auth(auth.access_token, { type: 'bearer' })
        .send({
          title,
          messageSpintax,
        })
        .expect(201)
        .then((response) => {
          const expectedData: ICampaign = {
            userId,
            uuid: response.body.data.uuid,
            title,
            messages: [{
              spintax: messageSpintax,
              hasMention: false,
              hasLink: false,
            }],
            sources: [],
            status: CampaignStatus.Draft,
            timestamp: response.body.data.timestamp,
          }

          debug(response.body.data)

          expect(response.type).toBe('application/json')
          expect(response.body.data).toEqual(expectedData)

          campaigns = [...campaigns, response.body.data]
        })
    })

    it('fails with missing data', async () => {
      return request(app)
        .post(url)
        .auth(auth.access_token, { type: 'bearer' })
        .send({
          title,
        })
        .expect(422)
        .then((response) => {
          debug(response.body)
        })
    })
  })

  describe('GET /campaigns', () => {
    const url = '/api/v1/mass-dm/campaigns'

    it('fails without access token', async () => {
      return request(app)
        .get(url)
        .expect(401)
    })

    it('succeeds with access token', async () => {
      return request(app)
        .get(url)
        .auth(auth.access_token, { type: 'bearer' })
        .expect(200)
        .then((response) => {
          expect(response.type).toBe('application/json')

          expect(isEqual(sortBy(map(response.body.data, 'uuid')), sortBy(map(campaigns, 'uuid')))).toBeTruthy()
        })
    })

    it('should not list campaigns from other user', async () => {
      return request(app)
        .get(url)
        .auth(auth.access_token, { type: 'bearer' })
        .expect(200)
        .then((response) => {
          expect(response.type).toBe('application/json')

          expect(map(response.body.data, 'uuid')).not.toContain(otherCampaigns[0].uuid)
        })
    })
  })

  describe('GET /campaigns/:id', () => {
    let url: string
    let otherUrl: string

    beforeAll(async () => {
      url = `/api/v1/mass-dm/campaigns/${campaigns[0].uuid}`
      otherUrl = `/api/v1/mass-dm/campaigns/${otherCampaigns[0].uuid}`
    })

    it('fails without access token', async () => {
      return request(app)
        .get(url)
        .expect(401)
    })

    it('succeeds with access token', async () => {
      return request(app)
        .get(url)
        .auth(auth.access_token, { type: 'bearer' })
        .expect(200)
        .then((response) => {
          expect(response.type).toBe('application/json')

          expect(response.body.data.uuid).toEqual(campaigns[0].uuid)
        })
    })

    it('should not be able to get campaign from another user', async () => {
      return request(app)
        .get(otherUrl)
        .auth(auth.access_token, { type: 'bearer' })
        .expect(404)
    })
  })

  describe('PATCH /campaigns/:id', () => {
    let url: string
    let otherUrl: string
    let oldTitle: string
    let newTitle: string

    beforeAll(async () => {
      url = `/api/v1/mass-dm/campaigns/${campaigns[0].uuid}`
      otherUrl = `/api/v1/mass-dm/campaigns/${otherCampaigns[0].uuid}`

      oldTitle = campaigns[0].title
      newTitle = 'New Title'

      expect(newTitle).not.toEqual(oldTitle)
    })

    it('fails without access token', async () => {
      return request(app)
        .get(url)
        .expect(401)
    })

    it('succeeds with access token', async () => {
      return request(app)
        .patch(url)
        .auth(auth.access_token, { type: 'bearer' })
        .send({
          title: newTitle,
        })
        .expect(200)
        .then((response) => {
          expect(response.type).toBe('application/json')

          expect(response.body.data.uuid).toEqual(campaigns[0].uuid)
          expect(response.body.data.title).toEqual(newTitle)
        })
    })

    it('should not be able to update campaign from another user', async () => {
      return request(app)
        .get(otherUrl)
        .auth(auth.access_token, { type: 'bearer' })
        .send({
          title: newTitle,
        })
        .expect(404)
    })
  })
})

module.exports = {}
