const express = require("express")
const res = require("express/lib/response")
const { cache } = require("joi")
const jwt = require("jsonwebtoken")

const checkAdmin = require("../middlewere/checkAdmin")
const chackId = require("../middlewere/checkId")
const validateBody = require("../middlewere/validateBody")
const validteId = require("../middlewere/validteId")
const checkToken = require("../middlewere/checkToken")
const router = express.Router()

const { City, cityAddJoi, cityEditJoi } = require("../models/City")
const { commentJoi } = require("../models/Comment")
const { User } = require("../models/User")

router.get("/", async (req, res) => {
  try {
    const cities = await City.find()
      .populate("restaurants")
      .populate("museums")
      .populate("malls")
      .populate("hotels")
      .populate("touristPlaces")
      .populate("events")
    res.json(cities)
  } catch (error) {
    res.status(500).send(error.message)
  }
})
///-------------------------------------------------------------------------one city
router.get("/:id", async (req, res) => {
  try {
    const city = await City.findById(req.params.id)
      .populate("restaurants")
      .populate("museums")
      .populate("malls")
      .populate("hotels")
      .populate("touristPlaces")
      .populate("events")
    res.json(city)
  } catch (error) {
    res.status(500).send(error.message)
  }
})
router.post("/", checkAdmin, validateBody(cityAddJoi), async (req, res) => {
  try {
    const { name, description, photo, lat, long } = req.body

    const cityNaw = new City({
      name,
      description,
      photo,
      lat,
      long,
    })
    await cityNaw.save()

    res.json(cityNaw)
  } catch (error) {
    res.status(500).send(error.massage)
  }
})

router.put("/:id", checkAdmin, chackId, validateBody(cityEditJoi), async (req, res) => {
  //هنا ارسلنا cityEditJoiونستقبله هناك وفي المدل وير
  try {
    //--في مدل وير -(طلعنا قيمتها) id الحين نشوف اذا هي اوبجكت id

    const { name, description, photo, lat, long } = req.body
    const city = await City.findByIdAndUpdate(
      req.params.id,
      { $set: { name, description, photo, lat, long } },
      { new: true }
    )

    if (!city) return res.status(404).end("city not found")

    res.json(city)
  } catch (error) {
    console.log(error)
    res.status(500).send(error.message)
  }
})
router.delete("/:id", checkAdmin, chackId, async (req, res) => {
  try {
    const city = await City.findByIdAndRemove(req.params.id)
    if (!city) return res.status(404).send("city not faund")
    res.send("city removed")
  } catch (error) {
    res.status(500).send(error.massage)
  }
})
//-------------------------------------------------------------------------------get comment
router.get("/:cityId/comments", validteId("cityId"), async (req, res) => {
  try {
    const city = await City.findById(req.params.cityId)
    if (!city) return res.status(404).send("city not found")

    const comments = await Comment.find({ cityId: req.params.cityId })
    res.json(comments)
  } catch (error) {
    res.status(500).send(error.message)
  }
})
//----------------------------------------------------post comment---------------------------------------------------
router.post("/:cityId/comments", checkToken, validteId("cityId"), validateBody(commentJoi), async (req, res) => {
  try {
    const { comment } = req.body
    const city = await City.findById(req.params.cityId)
    if (!city) return res.status(404).send("city not found")

    const newComment = new Comment({ comment, owner: req.userId, cityId: req.params.cityId })

    await City.findByIdAndUpdate(req.params.cityId, { $push: { comments: newComment._id } })

    await newComment.save()
    res.json(newComment)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

router.put(
  "/:cityId/comments/:commentId",
  checkToken,
  validteId("cityId", "commentId"),
  validateBody(commentJoi),

  async (req, res) => {
    try {
      const city = await City.findById(req.params.filmId)
      if (!city) return res.status(404).send("film not found")
      const { comment } = req.body

      const commentFound = await Comment.findById(req.params.commentId)
      if (!commentFound) return res.status(404).send("comment not found")

      if (commentFound.owner != req.userId) return res.status(403).send("unauthorized action")

      const updtedComment = await Comment.findByIdAndUpdate(req.params.commentId, { $set: { comment } }, { new: true })

      res.json(updtedComment)
    } catch (error) {
      console.log(error)
      res.status(500).send(error.message)
    }
  }
)
router.delete("/:cityId/comments/:commentId", checkToken, validteId("cityId", "commentId"), async (req, res) => {
  try {
    const city = await City.findById(req.params.cityId)
    if (!city) return res.status(404).send("city not found")

    const commentFound = await Comment.findById(req.params.commentId)
    if (!commentFound) return res.status(404).send("comment not found")

    const user = await User.findById(req.userId)

    if (user.role !== "Admin" && commentFound.owner != req.userId) return res.status(403).send("unauthorized action")

    await City.findByIdAndUpdate(req.params.cityId, { $pull: { comments: commentFound._id } })

    await Comment.findOneAndRemove(req.params.commentId)

    res.send("comment is removed")
  } catch (error) {
    console.log(error)
    res.status(500).send(error.message)
  }
})

// ------------------------------------------------likes----------------------------------
router.get("/:cityId/likes", checkToken, validteId("cityId"), async (req, res) => {
  try {
    let city = await City.findById(req.params.cityId)
    if (!city) return res.status(404).send("city not found ")

    const userFound = city.likes.find(like => like == req.userId)
    if (userFound) {
      await City.findByIdAndUpdate(req.params.cityId, { $pull: { likes: req.userId } })
      await User.findByIdAndUpdate(req.userId, { $pull: { likes: req.params.cityId } })
      res.send("removed like from city")
    } else {
      await City.findByIdAndUpdate(req.params.cityId, { $push: { likes: req.userId } })
      await User.findByIdAndUpdate(req.userId, { $push: { likes: req.params.cityId } })
      res.send("city liked")
    }
  } catch (error) {
    console.log(error)
    res.status(500).send(error.massage)
  }
})

module.exports = router
