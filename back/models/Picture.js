const mongoose = require('mongoose')
const { Schema } = mongoose;

const pictureSchema = new Schema({
    name: { type: String, required: true },
    url: { type: String },
    path: { type: String },
    album: { type: mongoose.Schema.Types.ObjectId, ref: 'Album' },

})

const Picture = mongoose.model('Picture', pictureSchema)

module.exports = Picture