var express = require('express');
var router = express.Router();
const mongoose = require('mongoose')

const Schema = mongoose.Schema
    // create Price model
const Price = new Schema({
    text: { type: String },
    value: { type: Number }
})

//////// MARK : Routes ////////////
router.get('/price-per-kilometer', function(request, response) {
    mongoose.model('Price', Price).find({}).limit(1).exec(function(error, data) {
        if (error) {
            return
        }
        response.json({
            data: data,
            message: "get query successfully"
        })
    })
})

module.exports = router;