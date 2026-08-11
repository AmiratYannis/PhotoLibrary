const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true }, // UserId retrieve from Cognito
    email: { type: String, required: true },
})

const User = mongoose.model('User', userSchema)

module.exports = User