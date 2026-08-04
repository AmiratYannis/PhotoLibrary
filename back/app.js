const express = require('express')
const mongoose = require('mongoose')
const path = require("path")
const cors = require('cors');
const User = require('./models/User')
const Album = require('./models/Album')


const app = express()

const MONGO_URL = "mongodb://localhost:27017/photolibrary"
const allowedOrigins = ['http://localhost:5173', 'https://main.d2sdaq07l1bg2y.amplifyapp.com'];


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
        const user = await User.findOneAndUpdate(
            { userId },
            { userId, email },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        )
        res.status(200).send(user);
    } catch (err) {
        res.status(400).send({ error: err.message })
    }
})

app.post('/api/albums', async (req, res) => {
    const { title, userId } = req.body
    try {
        const owner = await User.findOne({ userId })
        if (!owner) {
            return res.status(404).send({ error: 'User not found' })
        }

        const album = new Album({ title, owner: owner._id })
        await album.save()
        res.status(201).send(album)
    } catch (err) {
        res.status(400).send({ error: err.message })
    }
})

app.get('/api/albums', async (req, res) => {
    try {
        const albums = await Album.find()
        res.status(200).send(albums)
    } catch (err) {
        res.status(400).send({ error: err.message })
    }
})

