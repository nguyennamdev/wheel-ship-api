const mongoose = require('mongoose');
// create the schema object 
const Schema = mongoose.Schema

// create User model  
const Price = new Schema({
    pId: { type: String, required: true },
    name: { type: String },
    text: { type: String },
    value: { type: Number }
})

module.exports = mongoose.model('Price', Price);