import express from 'express'

import {CommonRoutesConfig} from '../common/common.routes.config'
import CampaignsController from './controllers/campaigns.controller'
import CampaignsMiddleware from './middlewares/campaigns.middleware'

export class CampaignsRoutes extends CommonRoutesConfig {
  constructor(app: express.Application) {
    super(app, 'CampaignRoutes')
  }

  configureRoutes(): express.Application {
    this.app.route(`/campaigns`)
      .get(CampaignsController.list)
      .post(
        CampaignsMiddleware.validateCreate,
        CampaignsController.create
      )

    this.app.route(`/campaigns/:uuid`)
      .get(CampaignsController.get)
      .patch(
        CampaignsMiddleware.validateUpdate,
        CampaignsController.update
      )
      .delete(CampaignsController.delete)

    return this.app
  }
}
