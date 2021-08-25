const express = require("express")
const router = express.Router()

require("dotenv").config()

const campaignsService = require("../services/campaigns")

router.get("/", async (req, res, _next) => {
  const campaigns = await campaignsService.list(req.user.id)

  res.render("mass-dm/index", {
    title: "Mass DM",
    campaigns
  })
})

router.get("/new", async (req, res, _next) => {
  const campaign = campaignsService.build()

  res.render("mass-dm/new", {
    title: "Create Mass DM Campaign",
    campaign
  })
})

module.exports = router
