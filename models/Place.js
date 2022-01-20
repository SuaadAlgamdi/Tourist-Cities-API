const mongoose = require("mongoose")
const Joi = require("joi")
const JoiObjectId = require("joi-objectid")
Joi.objectId = JoiObjectId(Joi)

const ratingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  rating: Number,
})

const placeSchema = new mongoose.Schema({
  name: String,
  description: String,
  location: String,
  vedio:String,
  website: String,
  ratings: [ratingSchema],
  ratingAvarage: {
    //فيها كل التقييم ويحسب
    type: Number,
    default: 0,
  },
  logo: String,
  photos: [String],
  products: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Product",
    },
  ],
  type: {
    type: String,
    enum: ["Restaurant", "Museum", "Mall", "Hotel", "TouristPlace", "Event"],
  },
  city: {
    type: mongoose.Types.ObjectId,
    ref: "City",
  },
  comments: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Comment",
    },
  ],
})

const placeAddJoi = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().min(2).max(1000).required(),
  location: Joi.string().min(1).max(1000).required(),
  logo: Joi.string().uri().required(),
  website: Joi.string().min(1).max(1000).required(),
  photos: Joi.array().items(Joi.string().uri()).min(1).max(100).required(),
  products: Joi.array().items(Joi.objectId()),
  city: Joi.objectId().required(),
  vedio:Joi.string().uri(),

  type: Joi.string().valid("Restaurant", "Museum", "Mall", "Hotel", "TouristPlace", "Event").required(),
})

const placeEditJoi = Joi.object({
  name: Joi.string().min(2).max(100),
  description: Joi.string().min(2).max(1000),
  location: Joi.string().min(1).max(1000),

  website: Joi.string().min(1).max(1000),
  logo: Joi.string().uri(),

  photos: Joi.array().items(Joi.string().uri()).min(1).max(100),
  city: Joi.objectId(),

  products: Joi.array().items(Joi.objectId()),
})

const ratingJoi = Joi.object({
  rating: Joi.number().min(0).max(5).required(),
})

const Place = mongoose.model("Place", placeSchema)

module.exports.Place = Place
module.exports.placeAddJoi = placeAddJoi
module.exports.placeEditJoi = placeEditJoi
module.exports.ratingJoi = ratingJoi
