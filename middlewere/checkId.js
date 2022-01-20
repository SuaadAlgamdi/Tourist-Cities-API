const mongoose = require("mongoose")

const chackId = async (req, res, next) => {
  try {
    const id = req.params.id //---(طلعنا قيمتها) id الحين نشوف اذا هي اوبجكت id
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(500).send("the path id is a valid id")

    next()
  } catch (error) {
    res.status(500).send(error.message)
  }
}
module.exports = chackId
