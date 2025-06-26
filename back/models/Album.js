const mongoose = require('mongoose')
const { Schema } = mongoose;

const albumSchema= new Schema({
    title: {type: String, required: true},
    pictures: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Picture' }],
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 

})

const Album = mongoose.model('Album', albumSchema);

module.exports= Album