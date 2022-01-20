const mongoose = require("mongoose")
const Joi = require("joi")

const commentSchema = new mongoose.Schema({
  comment: String,
  owner: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  placeId: {
    type: mongoose.Types.ObjectId,
    ref: "Place",
  },
})
const commentJoi = Joi.object({
  comment: Joi.string().min(3).max(1000).required(),
})

const Comment = mongoose.model("Comment", commentSchema)

module.exports.Comment = Comment
module.exports.commentJoi = commentJoi
