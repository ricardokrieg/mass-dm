import express from 'express'
import debug from 'debug'
import {isEmpty, get} from 'lodash'

const log: debug.IDebugger = debug("app:middleware:campaigns")

class CampaignsMiddleware {
  async validateCreate(req: express.Request, res: express.Response, next: express.NextFunction) {
    if (!isEmpty(get(req, 'body.title'))) {
      next()
    } else {
      res.status(400).send({ error: `Missing param: title` })
    }
  }

  async validateUpdate(req: express.Request, res: express.Response, next: express.NextFunction) {
    if (req.body && req.body.title) {
      next()
    } else {
      res.status(400).send({ error: `Missing param: title` })
    }
  }
}

export default new CampaignsMiddleware()
