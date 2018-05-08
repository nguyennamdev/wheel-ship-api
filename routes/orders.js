var express = require('express');
var router = express.Router();

const Order = require('../models/Order');

/////// MARK : routes //////////

// create method post request

router.post('/insert_new_order', function(request, response) {
    var conditions = {}
    if (request.body.orderId && request.body.orderId.length > 0) {
        conditions.orderId = request.body.orderId;
        Order.find(conditions).limit(1).exec(function(err, res) {
            if (err) {
                responseResult(false, response, "Query find is failed. Error is " + err, {})
            } else {
                // if orderId is exist, do not allows to insert 
                if (res.length > 0) {
                    responseResult(false, response, "Order alrealy", {})
                } else {
                    // create new order 
                    const order = createNewOrder(request);
                    Order.create(order, function(error, data) {
                        if (error) {
                            responseResult(false, response, "Insert failed. Error is " + error, res)
                        } else {
                            responseResult(true, response, "Insert new order is successfully", data)
                        }
                    })
                }
            }
        })
    } else {
        responseResult(false, response, "You must enter your uid", {})
    }
});

router.get('/order_by_user', function(request, response, next) {
    var conditions = {}
    if (request.query.userId && request.query.userId.length > 0) {
        conditions.userId = request.query.userId
        Order.find(conditions).exec(function(err, res) {
            if (err) {
                responseResult(false, response, "Find query failed. Error was " + err, {});
            } else {
                responseResult(true, response, "Find query successfully", res);
            }
        })
    } else {
        responseResult(true, response, "user id is null", {});
    }
})

router.get('/order_complete', function(request, response, next) {
    // query find order complete by user id
    var userIdCondition = {}
    if (request.query.userId && request.query.userId.length > 0) {
        // second condition
        var isCompleteCondition = { "isComplete": true }
        userIdCondition.userId = request.query.userId;
        Order.find({
            $and: [userIdCondition, isCompleteCondition]
        }).exec(function(err, res) {
            if (err) {
                responseResult(false, response, "Find query failed. Error was " + err);
            } else {
                responseResult(true, response, "Find query is successfully", res);
            }
        })
    } else {
        responseResult(false, response, "user id is null", {});
    }

})

router.delete('/delete_order', function(request, response) {
    var conditions = {}
    if (request.body.orderId && request.body.orderId.length > 0) {
        conditions.orderId = request.body.orderId
        Order.findOneAndRemove(conditions).exec(function(err, res) {
            if (err) {
                responseResult(false, response, "Delete query failed. Error was " + err, {})
            } else {
                responseResult(true, response, "Delete query is successfully", res)
            }
        })
    } else {
        responseResult(false, response, "order id is null", {})
    }
})

function createNewOrder(request) {
    const newOrder = {
        orderId: request.body.orderId,
        userId: request.body.userId,
        originAddress: request.body.originAddress,
        destinationAddress: request.body.destinationAddress,
        originLocation: {
            latitude: request.body.oriLatitude,
            longtitude: request.body.oriLongtitude
        },
        destinationLocation: {
            latitude: request.body.desLatitude,
            longtitude: request.body.desLongtitude
        },
        distance: request.body.distance,
        stopTime: request.body.stopTime,
        isFragile: request.body.isFragile,
        note: request.body.note,
        phoneReceiver: request.body.phoneReceiver,
        weight: request.body.weight,
        status: request.body.status,
        prepayment: request.body.prepayment,
        feeShip: request.body.feeShip,
        priceOfWeight: request.body.priceOfWeight,
        priceOfOrderFragile: request.body.priceOfOrderFragile,
        overheads: request.body.overheads,
        isComplete: request.body.isComplete,
        shipperId: request.body.shipperId
    }
    return newOrder
}

function responseResult(result, response, message, data) {
    response.json({
        result: result,
        data: data,
        message: message,
        size: data.length
    })
}
module.exports = router;