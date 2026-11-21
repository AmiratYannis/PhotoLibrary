const request = require('supertest')
const mongoose = require('mongoose')
const { DeleteObjectCommand } = require('@aws-sdk/client-s3')

// Replace Cognito verification: the test user is read from a header instead of a JWT
jest.mock('../middleware/auth', () => (req, res, next) => {
    const userId = req.headers['x-test-user']
    if (!userId) {
        return res.status(401).send({ error: 'Missing authorization token' })
    }
    req.userId = userId
    req.userEmail = `${userId}@test.com`
    next()
})

// No real S3 calls: deletes resolve, signed URLs are built from the object key
jest.mock('../config/s3', () => ({ send: jest.fn().mockResolvedValue({}) }))
jest.mock('@aws-sdk/s3-request-presigner', () => ({
    getSignedUrl: jest.fn(async (client, command) => `https://signed.test/${command.input.Key}`),
}))

const app = require('../app')
const s3 = require('../config/s3')
const User = require('../models/User')
const Album = require('../models/Album')
const Picture = require('../models/Picture')

const TEST_DB_URI = 'mongodb://localhost:27017/photolibrary-test'

const ALICE = 'alice-sub'
const BOB = 'bob-sub'

const as = (userId) => ({ 'x-test-user': userId })

async function registerUser(userId) {
    const res = await request(app).post('/api/users').set(as(userId))
    return res.body
}

async function createAlbum(userId, title) {
    const res = await request(app).post('/api/albums').set(as(userId)).send({ title })
    return res.body
}

async function createPicture(userId, albumId, name) {
    const uploadRes = await request(app)
        .post(`/api/albums/${albumId}/upload-url`)
        .set(as(userId))
        .send({ filename: `${name}.jpg`, contentType: 'image/jpeg' })
    const res = await request(app)
        .post('/api/pictures')
        .set(as(userId))
        .send({ name, key: uploadRes.body.key, albumId })
    return res.body
}

function deletedS3Keys() {
    return s3.send.mock.calls
        .map(([command]) => command)
        .filter((command) => command instanceof DeleteObjectCommand)
        .map((command) => command.input.Key)
}

describe('PhotoLibrary routes with MongoDB', () => {
    let alice

    beforeAll(async () => {
        await mongoose.connect(TEST_DB_URI)
    })

    beforeEach(async () => {
        jest.clearAllMocks()
        await Promise.all([User.deleteMany({}), Album.deleteMany({}), Picture.deleteMany({})])
        alice = await registerUser(ALICE)
    })

    afterAll(async () => {
        await mongoose.connection.dropDatabase()
        await mongoose.connection.close()
    })

    describe('Authentication', () => {
        test.each([
            ['post', '/api/users'],
            ['post', '/api/albums'],
            ['get', '/api/albums'],
            ['put', '/api/albums/000000000000000000000000'],
            ['delete', '/api/albums/000000000000000000000000'],
            ['post', '/api/albums/000000000000000000000000/upload-url'],
            ['get', '/api/albums/000000000000000000000000/pictures'],
            ['post', '/api/pictures'],
            ['delete', '/api/pictures/000000000000000000000000'],
        ])('%s %s should return 401 without a token', async (method, url) => {
            const res = await request(app)[method](url)
            expect(res.statusCode).toBe(401)
        })
    })

    describe('Users', () => {
        test('POST /api/users should create the user once', async () => {
            await registerUser(ALICE) // second call must not duplicate

            const users = await User.find({ userId: ALICE })
            expect(users).toHaveLength(1)
            expect(users[0].email).toBe(`${ALICE}@test.com`)
        })
    })

    describe('Albums', () => {
        test('POST /api/albums should create an album owned by the user', async () => {
            const res = await request(app).post('/api/albums').set(as(ALICE)).send({ title: 'Holidays' })

            expect(res.statusCode).toBe(201)
            expect(res.body).toMatchObject({ title: 'Holidays', owner: alice._id, pictures: [] })

            const albumInDb = await Album.findById(res.body._id)
            expect(albumInDb).not.toBeNull()
            expect(albumInDb.owner.toString()).toBe(alice._id)
        })

        test('POST /api/albums should return 400 without a title', async () => {
            const res = await request(app).post('/api/albums').set(as(ALICE)).send({})

            expect(res.statusCode).toBe(400)
            expect(await Album.countDocuments()).toBe(0)
        })

        test('POST /api/albums should return 404 for an unregistered user', async () => {
            const res = await request(app).post('/api/albums').set(as(BOB)).send({ title: 'Holidays' })

            expect(res.statusCode).toBe(404)
            expect(await Album.countDocuments()).toBe(0)
        })

        test('GET /api/albums should return only the user\'s albums', async () => {
            await registerUser(BOB)
            await createAlbum(ALICE, 'Alice album')
            await createAlbum(BOB, 'Bob album')

            const res = await request(app).get('/api/albums').set(as(ALICE))

            expect(res.statusCode).toBe(200)
            expect(res.body.map((album) => album.title)).toEqual(['Alice album'])
        })

        test('PUT /api/albums/:albumId should update the title', async () => {
            const album = await createAlbum(ALICE, 'Old title')

            const res = await request(app).put(`/api/albums/${album._id}`).set(as(ALICE)).send({ title: 'New title' })

            expect(res.statusCode).toBe(200)
            expect(res.body.title).toBe('New title')
            expect((await Album.findById(album._id)).title).toBe('New title')
        })

        test('PUT /api/albums/:albumId should return 400 with an empty title', async () => {
            const album = await createAlbum(ALICE, 'Old title')

            const res = await request(app).put(`/api/albums/${album._id}`).set(as(ALICE)).send({ title: '' })

            expect(res.statusCode).toBe(400)
            expect((await Album.findById(album._id)).title).toBe('Old title')
        })

        test('PUT /api/albums/:albumId should return 404 for another user\'s album', async () => {
            await registerUser(BOB)
            const album = await createAlbum(ALICE, 'Alice album')

            const res = await request(app).put(`/api/albums/${album._id}`).set(as(BOB)).send({ title: 'Hacked' })

            expect(res.statusCode).toBe(404)
            expect((await Album.findById(album._id)).title).toBe('Alice album')
        })

        test('DELETE /api/albums/:albumId should delete the album, its pictures and their S3 objects', async () => {
            const album = await createAlbum(ALICE, 'To delete')
            const pic1 = await createPicture(ALICE, album._id, 'pic1')
            const pic2 = await createPicture(ALICE, album._id, 'pic2')

            const res = await request(app).delete(`/api/albums/${album._id}`).set(as(ALICE))

            expect(res.statusCode).toBe(204)
            expect(await Album.findById(album._id)).toBeNull()
            expect(await Picture.countDocuments({ album: album._id })).toBe(0)
            expect(deletedS3Keys().sort()).toEqual([pic1.url, pic2.url].sort())
        })

        test('DELETE /api/albums/:albumId should return 404 for another user\'s album', async () => {
            await registerUser(BOB)
            const album = await createAlbum(ALICE, 'Alice album')
            await createPicture(ALICE, album._id, 'pic')

            const res = await request(app).delete(`/api/albums/${album._id}`).set(as(BOB))

            expect(res.statusCode).toBe(404)
            expect(await Album.findById(album._id)).not.toBeNull()
            expect(await Picture.countDocuments({ album: album._id })).toBe(1)
            expect(deletedS3Keys()).toEqual([])
        })
    })

    describe('Pictures', () => {
        let album

        beforeEach(async () => {
            album = await createAlbum(ALICE, 'Album')
        })

        test('POST /api/albums/:albumId/upload-url should return a signed URL and a key scoped to the album', async () => {
            const res = await request(app)
                .post(`/api/albums/${album._id}/upload-url`)
                .set(as(ALICE))
                .send({ filename: 'photo.jpg', contentType: 'image/jpeg' })

            expect(res.statusCode).toBe(200)
            expect(res.body.key.startsWith(`users/${alice._id}/${album._id}/`)).toBe(true)
            expect(res.body.key.endsWith('-photo.jpg')).toBe(true)
            expect(res.body.uploadUrl).toBe(`https://signed.test/${res.body.key}`)
        })

        test('POST /api/albums/:albumId/upload-url should return 404 for another user\'s album', async () => {
            await registerUser(BOB)

            const res = await request(app)
                .post(`/api/albums/${album._id}/upload-url`)
                .set(as(BOB))
                .send({ filename: 'photo.jpg', contentType: 'image/jpeg' })

            expect(res.statusCode).toBe(404)
        })

        test('POST /api/pictures should insert the picture and link it to the album', async () => {
            const key = `users/${alice._id}/${album._id}/uuid-photo.jpg`

            const res = await request(app)
                .post('/api/pictures')
                .set(as(ALICE))
                .send({ name: 'photo', key, albumId: album._id })

            expect(res.statusCode).toBe(201)
            expect(res.body).toMatchObject({ name: 'photo', url: key, album: album._id })

            expect(await Picture.findById(res.body._id)).not.toBeNull()
            const albumInDb = await Album.findById(album._id)
            expect(albumInDb.pictures.map(String)).toEqual([res.body._id])
        })

        test('POST /api/pictures should return 403 with a key from another album', async () => {
            const otherAlbum = await createAlbum(ALICE, 'Other album')
            const key = `users/${alice._id}/${otherAlbum._id}/uuid-photo.jpg`

            const res = await request(app)
                .post('/api/pictures')
                .set(as(ALICE))
                .send({ name: 'photo', key, albumId: album._id })

            expect(res.statusCode).toBe(403)
            expect(await Picture.countDocuments()).toBe(0)
        })

        test('POST /api/pictures should return 400 without a name', async () => {
            const key = `users/${alice._id}/${album._id}/uuid-photo.jpg`

            const res = await request(app)
                .post('/api/pictures')
                .set(as(ALICE))
                .send({ key, albumId: album._id })

            expect(res.statusCode).toBe(400)
            expect(await Picture.countDocuments()).toBe(0)
            expect((await Album.findById(album._id)).pictures).toHaveLength(0)
        })

        test('POST /api/pictures should return 404 for another user\'s album', async () => {
            const bob = await registerUser(BOB)
            const key = `users/${bob._id}/${album._id}/uuid-photo.jpg`

            const res = await request(app)
                .post('/api/pictures')
                .set(as(BOB))
                .send({ name: 'photo', key, albumId: album._id })

            expect(res.statusCode).toBe(404)
            expect(await Picture.countDocuments()).toBe(0)
        })

        test('GET /api/albums/:albumId/pictures should return the album\'s pictures with signed URLs', async () => {
            const otherAlbum = await createAlbum(ALICE, 'Other album')
            const pic = await createPicture(ALICE, album._id, 'mine')
            await createPicture(ALICE, otherAlbum._id, 'elsewhere')

            const res = await request(app).get(`/api/albums/${album._id}/pictures`).set(as(ALICE))

            expect(res.statusCode).toBe(200)
            expect(res.body).toEqual([
                { _id: pic._id, name: 'mine', url: `https://signed.test/${pic.url}` },
            ])
        })

        test('GET /api/albums/:albumId/pictures should return 404 for another user\'s album', async () => {
            await registerUser(BOB)
            await createPicture(ALICE, album._id, 'mine')

            const res = await request(app).get(`/api/albums/${album._id}/pictures`).set(as(BOB))

            expect(res.statusCode).toBe(404)
        })

        test('DELETE /api/pictures/:pictureId should delete the picture, unlink it and delete the S3 object', async () => {
            const pic = await createPicture(ALICE, album._id, 'to-delete')
            const kept = await createPicture(ALICE, album._id, 'kept')

            const res = await request(app).delete(`/api/pictures/${pic._id}`).set(as(ALICE))

            expect(res.statusCode).toBe(204)
            expect(await Picture.findById(pic._id)).toBeNull()
            expect(await Picture.findById(kept._id)).not.toBeNull()
            expect((await Album.findById(album._id)).pictures.map(String)).toEqual([kept._id])
            expect(deletedS3Keys()).toEqual([pic.url])
        })

        test('DELETE /api/pictures/:pictureId should return 404 for another user\'s picture', async () => {
            await registerUser(BOB)
            const pic = await createPicture(ALICE, album._id, 'mine')

            const res = await request(app).delete(`/api/pictures/${pic._id}`).set(as(BOB))

            expect(res.statusCode).toBe(404)
            expect(await Picture.findById(pic._id)).not.toBeNull()
            expect(deletedS3Keys()).toEqual([])
        })

        test('DELETE /api/pictures/:pictureId should return 404 for an unknown picture', async () => {
            const res = await request(app)
                .delete(`/api/pictures/${new mongoose.Types.ObjectId()}`)
                .set(as(ALICE))

            expect(res.statusCode).toBe(404)
        })
    })
})
