require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const path = require("path")
const crypto = require('crypto')
const cors = require('cors');
const { PutObjectCommand } = require('@aws-sdk/client-s3')
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')
const User = require('./models/User')
const Album = require('./models/Album')
const Picture = require('./models/Picture')
const requireAuth = require('./middleware/auth')
const s3 = require('./config/s3')


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


app.post('/api/users', requireAuth, async (req, res) => {
    const { userId, userEmail } = req
    try {
        const user = await User.findOneAndUpdate(
            { userId },
            { userId, email: userEmail },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        )
        res.status(200).send(user);
    } catch (err) {
        res.status(400).send({ error: err.message })
    }
})

app.post('/api/albums', requireAuth, async (req, res) => {
    const { title } = req.body
    try {
        const owner = await User.findOne({ userId: req.userId })
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

app.get('/api/albums', requireAuth, async (req, res) => {
    try {
        const owner = await User.findOne({ userId: req.userId })
        if (!owner) {
            return res.status(404).send({ error: 'User not found' })
        }

        const albums = await Album.find({ owner: owner._id })
        res.status(200).send(albums)
    } catch (err) {
        res.status(400).send({ error: err.message })
    }
})

app.post('/api/albums/:albumId/upload-url', requireAuth, async (req, res) => {
    const { albumId } = req.params
    const { filename, contentType } = req.body
    try {
        const owner = await User.findOne({ userId: req.userId })
        if (!owner) {
            return res.status(404).send({ error: 'User not found' })
        }

        const album = await Album.findOne({ _id: albumId, owner: owner._id })
        if (!album) {
            return res.status(404).send({ error: 'Album not found' })
        }

        const key = `users/${owner._id}/${albumId}/${crypto.randomUUID()}-${filename}`

        const command = new PutObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: key,
            ContentType: contentType,
        })

        const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 })

        res.status(200).send({ uploadUrl, key })
    } catch (err) {
        res.status(400).send({ error: err.message })
    }
})

app.post('/api/pictures', requireAuth, async (req, res) => {
    const { name, key, albumId } = req.body
    try {
        const owner = await User.findOne({ userId: req.userId })
        if (!owner) {
            return res.status(404).send({ error: 'User not found' })
        }

        const album = await Album.findOne({ _id: albumId, owner: owner._id })
        if (!album) {
            return res.status(404).send({ error: 'Album not found' })
        }

        const picture = new Picture({ name, url: key, album: album._id })
        await picture.save()

        album.pictures.push(picture._id)
        await album.save()

        res.status(201).send(picture)
    } catch (err) {
        res.status(400).send({ error: err.message })
    }
})

