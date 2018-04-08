var express = require('express');
var router = express.Router();
var Price = require('./../models/Price');


//////// MARK : Routes ////////////
router.get('/', function(request, response) {
    Price.find({}).sort({ "pId": 1 }).exec(function(error, data) {
        if (error) {
            return
        }
        response.json({
            data: data,
            message: "get query successfully"
        })
    })
})

router.get('/price_weights', function(request, response) {
    Price.find({ "category": "weight" }).sort({ "pId": 1 }).exec(function(error, data) {
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