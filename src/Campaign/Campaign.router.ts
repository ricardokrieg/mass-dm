import express from "express"
const router = express.Router()
const debug = require('debug')('mkt:routers:mass-dm')

import {list} from './Campaign.service'

router.get('/', async (req, res, _next) => {
  // @ts-ignore
  const user = req.user

  debug(user)

  const campaigns = await list({ userId: user.sub })

  res.json({
    data: campaigns,
  })

  // res.json("mass-dm/index", {
  //   title: "Mass DM",
  //   currentPage: "mass-dm",
  //   currentDMTab: "all",
  //   campaigns,
  // })
})

// router.get("/pending", async (req, res, _next) => {
//   const campaigns = await campaignsService.list(req.user.id, "pending")
//
//   res.render("mass-dm/index", {
//     title: "Mass DM",
//     currentPage: "mass-dm",
//     currentDMTab: "pending",
//     campaigns,
//   })
// })
//
// router.get("/active", async (req, res, _next) => {
//   const campaigns = await campaignsService.list(req.user.id, "active")
//
//   res.render("mass-dm/index", {
//     title: "Mass DM",
//     currentPage: "mass-dm",
//     currentDMTab: "active",
//     campaigns,
//   })
// })
//
// router.get("/completed", async (req, res, _next) => {
//   const campaigns = await campaignsService.list(req.user.id, "completed")
//
//   res.render("mass-dm/index", {
//     title: "Mass DM",
//     currentPage: "mass-dm",
//     currentDMTab: "completed",
//     campaigns,
//   })
// })
//
// router.get("/new", async (req, res, _next) => {
//   res.render("mass-dm/new", {
//     title: "Create Mass DM Campaign",
//     currentPage: "mass-dm",
//   })
// })
//
// router.post("/create", async (req, res, _next) => {
//   const campaign = await campaignsService.create(req.user.id, req.body.title, req.body.message)
//
//   res.redirect(`/${campaign.uuid}`)
// })
//
// router.get("/:uuid", async (req, res, _next) => {
//   const campaign = await campaignsService.details(req.user.id, req.params.uuid)
//
//   res.render("mass-dm/show", {
//     title: campaign.title,
//     currentPage: "mass-dm",
//     campaign,
//   })
// })

export default router
