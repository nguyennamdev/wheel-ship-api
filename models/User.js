const mongoose = require('mongoose')
    // create the schema object 
const Schema = mongoose.Schema

// create model User 
const User = new Schema({
    uid: { type: String, required: true },
    name: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true },
    imageUrl: { type: String, default: "" },
    phoneNumber: { type: String, default: "" },
    region: { type: String, default: "" },
    typeOfUser: { type: String, default: "" }
})

module.exports = mongoose.model('User', User)