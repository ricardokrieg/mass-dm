import request from 'supertest'

import app from '../../index'

describe('Post Endpoints', () => {
  it('should create a new post', async () => {
    const res = await request(app)
      .get('/api/v1/mass-dm/campaigns')

    expect(res.statusCode).toEqual(200)
    // expect(res.body).toHaveProperty('post')
  })
})

module.exports = {}
