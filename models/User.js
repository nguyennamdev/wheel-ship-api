const mongoose = require('mongoose')
    // create the schema object 
const Schema = mongoose.Schema

// create User model  
const User = new Schema({
    uid: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    imageUrl: { type: String, default: "" },
    phoneNumber: { type: String, default: "" },
    isActive: { type: Number, default: 0 }, // 0 = isActive
    isShipper: { type: Number, default: 0 } // 0 = orderer 
})

module.exports = mongoose.model('User', User)