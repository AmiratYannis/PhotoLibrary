const mongoose = require('mongoose')
const { Schema } = mongoose;

const pictureSchema = new Schema({
    filename: { type: String, required: true },
    url: { type: String, required: true },
    album: { type: mongoose.Schema.Types.ObjectId, ref: 'Album' },
})

const Picture = mongoose.model('Picture',pictureSchema)

module.exports = Picture