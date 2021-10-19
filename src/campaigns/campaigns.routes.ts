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
      .get(CampaignsController.all)
      .post(
        CampaignsController.create
      )

    this.app.route(`/campaigns/:id`)
      .all(CampaignsMiddleware.validateCampaignExists)
      .get(CampaignsController.get)
      .patch(
        CampaignsController.update
      )
      .delete(CampaignsController.delete)

    return this.app
  }
}
