const express = require("express")
const jwt = require("jsonwebtoken")
const router = express.Router()
const bcrypt = require("bcrypt")
const checkToken = require("../middlewere/checkToken")
const checkAdmin = require("../middlewere/checkAdmin")

const { User, signupJoi, loginJoi, profileJoi } = require("../models/User")
const validateBody = require("../middlewere/validateBody")
const req = require("express/lib/request")

router.post("/singup", validateBody(signupJoi), async (req, res) => {
  try {
    //-----------------------------------------------------------صنعنا اليوزر  2 نتفقده اذا مو موجود واذا موجود انتل 3ث
    const { firstName, lastName, email, password, avatar } = req.body

    const userFound = await User.findOne({ email }) //اذا ما كان موجود 3
    if (userFound) return res.status(400).send("user already registed")

    //---------------ونستطيع نصنع
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)

    const user = new User({
      firstName,
      lastName,
      email,
      password: hash,
      avatar,
      role: "User",
    })
    //---------------الان صنعته لازم ارسله
    await user.save()

    delete user._doc.password
    res.json(user)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body //------------------نستخرج البودي
    const result = loginJoi.validate(req.body)
    if (result.error) return res.status(400).send(result.error.details[0].message)

    const user = await User.findOne({ email })
    if (!user) return res.status(404).send("user not found")

    const vaild = await bcrypt.compare(password, user.password)
    if (!vaild) return res.status(400).send("password incorrect")

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECREY_KEY, { expiresIn: "15d" })
    res.send(token)
  } catch (error) {
    res.status(500).send(error.massage)
  }
})

// --------------------------------getUsers--------------------------------------------------
router.get("/users", async (req, res) => {
  const uesrs = await User.find()
  res.json(uesrs)
})

router.delete("/:userId",checkAdmin, async(req,res)=>{
  const uesr=await User.findByIdAndRemove(req.params.userId)
  res.json("user Reemoved")
})
//------------------------------------------------------------Add Admin----------------------------------------------------//

router.post("/add-admin",checkAdmin, validateBody(signupJoi), async (req, res) => {
  try {
    //-----------------------------------------------------------صنعنا اليوزر  2 نتفقده اذا مو موجود واذا موجود انتل 3ث
    const { firstName, lastName, email, password, avatar } = req.body

    const userFound = await User.findOne({ email }) //اذا ما كان موجود 3
    if (userFound) return res.status(400).send("user already registed")

    //---------------ونستطيع نصنع
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)

    const user = new User({
      firstName,
      lastName,
      email,
      password: hash,
      avatar,
      role: "Admin",
    })
    //---------------الان صنعته لازم ارسله
    await user.save()

    delete user._doc.password
    res.json(user)
  } catch (error) {
    res.status(500).send(error.massage)
  }
})

router.post("/loginadmin", validateBody(loginJoi), async (req, res) => {
  try {
    const { email, password } = req.body //------------------نستخرج البودي

    const user = await User.findOne({ email })
    if (!user) return res.status(404).send("user not found")

    const vaild = await bcrypt.compare(password, user.password)
    if (!vaild) return res.status(400).send("password incorrect")

if (user.role != "Admin")  return res.status(403).send("you are not admin")

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECREY_KEY, { expiresIn: "15d" })
    res.send(token)
  } catch (error) {
    res.status(500).send(error.massage)
  }
})

router.get("/profile", checkToken, async (req, res) => {
  const user = await User.findById(req.userId).select("-__v -password")

  res.json(user)
})
//------------------------------------------------------------------------------userيقدر يعدلعلى يوزره

router.put("/profile", checkToken, validateBody(profileJoi), async (req, res) => {
  const { firstName, lastName, password, avatar } = req.body

  let hash
  if (password) {
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)
  }

  const user = await User.findByIdAndUpdate(
    req.userId,
    { $set: { firstName, lastName, password: hash, avatar } },
    { new: true }
  ).select("-__v-password")
  res.json(user)
})

module.exports = router
