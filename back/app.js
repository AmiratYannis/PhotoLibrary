const express= require('express')
const mongoose = require('mongoose')
const path = require("path")

const app = express()

const MONGO_URL = "mongodb://mongo:27017/photolibrary"

mongoose.connect(MONGO_URL)

app.listen(3000, () => {
    console.log('Application launched in port 3000')
})