const express = require("express")
const router = express.Router()

require("dotenv").config()

const campaignsService = require("../services/campaigns")

router.get("/", async (req, res, _next) => {
  const campaigns = await campaignsService.list(req.user.id)

  res.render("mass-dm/index", {
    title: "Mass DM",
    currentPage: "mass-dm",
    currentDMTab: "all",
    campaigns,
  })
})

router.get("/active", async (req, res, _next) => {
  const campaigns = await campaignsService.list(req.user.id)

  res.render("mass-dm/index", {
    title: "Mass DM",
    currentPage: "mass-dm",
    currentDMTab: "active",
    campaigns,
  })
})

router.get("/completed", async (req, res, _next) => {
  const campaigns = await campaignsService.list(req.user.id)

  res.render("mass-dm/index", {
    title: "Mass DM",
    currentPage: "mass-dm",
    currentDMTab: "completed",
    campaigns,
  })
})

router.get("/new", async (req, res, _next) => {
  res.render("mass-dm/new", {
    title: "Create Mass DM Campaign",
    currentPage: "mass-dm",
  })
})

router.post("/create", async (req, res, _next) => {
  const campaign = await campaignsService.create(req.user.id, req.body.title)

  res.render("mass-dm/show", {
    title: "Mass DM Campaign",
    currentPage: "mass-dm",
    campaign,
  })
})

module.exports = router
