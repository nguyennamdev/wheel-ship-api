var express = require('express');
var router = express.Router();
var Price = require('./../models/Price');


//////// MARK : Routes ////////////
router.get('/', function(request, response) {
    Price.find({}).exec(function(error, data) {
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