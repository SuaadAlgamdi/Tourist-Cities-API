const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
require("dotenv").config()
const Joi = require("joi")
const JoiObjectId = require("joi-objectid")
Joi.objectId = JoiObjectId(Joi)
const users = require("./routes/users")
const cities = require("./routes/cities")
const places = require("./routes/places")
const products =require("./routes/products")

mongoose
  .connect(`mongodb://localhost:27017/toutisDB`)
  .then(() => console.log("Connected to MongoDB"))
  .catch(error => console.log("Erroe connecting to MongoDB", error))

const app = express()

app.use(express.json())
app.use(cors())
app.use("/api/auth", users)
app.use("/api/cities", cities)
app.use("/api/places", places)
app.use("/api/products", products)


const port = 5000

app.listen(port, () => console.log("Server is listening " + port))
