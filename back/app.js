const express = require('express')
const mongoose = require('mongoose')
const path = require("path")
const cors = require('cors');


const app = express()

const MONGO_URL = "mongodb://localhost:27017/photolibrary"
const allowedOrigins = ['http://localhost:5174'];


mongoose.connect(MONGO_URL)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Unable to connect to MongoDB'))

app.use(express.json());

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']

}))


app.listen(3000, () => {
    console.log('Application launched in port 3000')
})

app.use(express.urlencoded({ extended: false }))


app.post('/api/users', async (req, res) => {
    const { userId, email } = req.body
    try {
        const user = new User({ userId, email })
        await user.save()
        res.status(201).send(user);
    } catch (err) {
        res.status(400).send({ error: err.message })
    }
})

