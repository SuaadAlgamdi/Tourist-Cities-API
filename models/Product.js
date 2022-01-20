const mongoose = require("mongoose")
const Joi = require("joi")

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  photo: String,
  description: String,

  place: {
    type: mongoose.Types.ObjectId,
    ref: "Place",
  },
})

const productJoi = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  price: Joi.number().min(0).max(1000),
  photo: Joi.string().uri().min(2).max(1000).required(),
  description: Joi.string().min(20).max(1000).required(),
  place: Joi.objectId().required(),
})

const productEditJoi = Joi.object({
  name: Joi.string().min(2).max(100),
  price: Joi.number().min(0).max(1000),
  photo: Joi.string().uri().min(2).max(1000),
  description: Joi.string().min(20).max(1000),
})

const Product = mongoose.model("Product", productSchema)

module.exports.Product = Product
module.exports.productJoi = productJoi
module.exports.productEditJoi = productEditJoi
