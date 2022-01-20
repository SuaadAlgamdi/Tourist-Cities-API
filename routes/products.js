const express = require("express")
const checkAdmin = require("../middlewere/checkAdmin")
const validateBody = require("../middlewere/validateBody")
const checkId = require("../middlewere/checkId")
const { Place } = require("../models/Place")
const router = express.Router()
const { Product, productJoi, productEditJoi } = require("../models/Product")
const validteId = require("../middlewere/validteId")
const checkToken = require("../middlewere/checkToken")
const { commentJoi, Comment } = require("../models/Comment")

router.get("/", async (req, res) => {
  try {
    const products = await Product.find().populate("place")
    // .populate({
    //   path: "comments",
    //   populate: {
    //     path: "owner",
    //     select: "-password -email -likes -role",
    //   },
    // })

    res.json(products)
  } catch (error) {
    res.status(500).send(error.message)
  }
})
// ---------------------------------------------getone-------------------
router.get("/:id", checkId, async (req, res) => {
  try {
    const products = await Product.findById(req.params.id).populate({
      path: "place",
      populate: "city",
      path: "comments",
      populate: {
        path: "owner",
        select: "-password-email=likes-role",
      },
    })
    res.json(products)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

router.post("/", checkAdmin, validateBody(productJoi), async (req, res) => {
  const { name, price, photo, description, place } = req.body

  const nawProductes = new Product({
    name,
    photo,
    price,
    description,
    place,
  })
  await nawProductes.save()
  await Place.findByIdAndUpdate(place, { $push: { products: nawProductes._id } })
  res.json(nawProductes)
})

// ----------------------------------------------for____dishbord------------------------------
router.put("/:productId", checkAdmin, validateBody(productEditJoi), async (req, res) => {
  try {
    const { name, price, description, photo } = req.body
    const productNew = await Product.findByIdAndUpdate(
      req.params.productId,
      {
        $set: {
          name,
          price,
          description,
          photo,
        },
      },
      { new: true }
    )

    res.json(productNew)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

router.delete("/:productId", async (req, res) => {
  const products = await Product.findByIdAndRemove(req.params.productId)
  if (!products) return res.status(404).send("product not found")
  res.json("product is removed")
})
//-------------------------------------------------------------------------------get comment
router.get("/:productId/comments", validteId("productId"), async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId).populate("comments")
    if (!product) return res.status(404).send("product not found")

    const comments = await Comment.find({ productId: req.params.productId })
    res.json(comments)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

module.exports = router
