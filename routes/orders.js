var express = require('express');
var router = express.Router();

const Order = require('../models/Order');

/////// MARK : routes //////////


// MARK: Methods post

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
                            responseResult(true, response, "Insert new order was successful", data)
                        }
                    })
                }
            }
        })
    } else {
        responseResult(false, response, "You must enter your uid", {})
    }
});

// MARK: Methods get
router.get('/order_by_user', function(request, response, next) {
    var conditions = {}
    if (request.query.userId && request.query.userId.length > 0) {
        conditions.userId = request.query.userId
        Order.find(conditions).exec(function(err, res) {
            if (err) {
                responseResult(false, response, "Find query failed. Error was " + err, {});
            } else {
                responseResult(true, response, "Find query was successful", res);
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
                responseResult(true, response, "Find query was successful", res);
            }
        })
    } else {
        responseResult(false, response, "user id is null", {});
    }

})
router.get('/order_by_orderId', function(request, response) {
    var conditions = {}
    if (request.query.orderId && request.query.orderId.length > 0) {
        conditions.orderId = request.query.orderId
        Order.findOne(conditions, function(err, data) {
            if (err) {
                responseResult(false, response, "Find query failed. Error was " + err, {});
            } else {
                responseResult(true, response, "Find query was successful", data)
            }
        })
    } else {
        responseResult(false, response, "order id is null")
    }
})

// MARK: Method put
router.put('/update_order', function(request, response) {
    var conditions = {}
    if (request.body.orderId && request.body.orderId.length > 0) {
        conditions.orderId = request.body.orderId
        const orderToUpdate = createOrderToUpdate(request)
        Order.findOneAndUpdate(conditions, { $set: orderToUpdate }, { new: true }, (err, data) => {
            if (err) {
                responseResult(false, response, "Update query failed. Error was " + err, {})
            } else {
                responseResult(true, response, "Update query was successful", data)
            }
        })
    } else {
        responseResult(false, response, "Order id is null", {})
    }
})

// MARK: Method delete
router.delete('/delete_order', function(request, response) {
    var conditions = {}
    if (request.body.orderId && request.body.orderId.length > 0) {
        conditions.orderId = request.body.orderId
        Order.findOneAndRemove(conditions).exec(function(err, res) {
            if (err) {
                responseResult(false, response, "Delete query failed. Error was " + err, {})
            } else {
                responseResult(true, response, "Delete query was successful", res)
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

function createOrderToUpdate(request) {
    const updateOrder = {}
        // check parameters value not null to update order
    if (request.body.originAddress && request.body.originAddress.length > 0) {
        updateOrder.originAddress = request.body.originAddress
    }
    if (request.body.oriLatitude && request.body.oriLatitude.length > 0) {
        updateOrder.oriLatitude = request.body.oriLatitude
    }
    if (request.body.oriLongtitude && request.body.oriLongtitude.length > 0) {
        updateOrder.oriLongtitude = request.body.oriLongtitude
    }
    if (request.body.destinationAddress && request.body.destinationAddress.length > 0) {
        updateOrder.destinationAddress = request.body.destinationAddress
    }
    if (request.body.desLatitude && request.body.desLatitude.length > 0) {
        updateOrder.desLatitude = request.body.desLatitude
    }
    if (request.body.desLongtitude && request.body.desLongtitude.length > 0) {
        updateOrder.desLongtitude = request.body.desLongtitude
    }
    if (request.body.distance && request.body.distance.length > 0) {
        updateOrder.distance = request.body.distance
    }
    if (request.body.isFragile && request.body.isFragile.length > 0) {
        updateOrder.isFragile = request.body.isFragile
    }
    if (request.body.note && request.body.note.length > 0) {
        updateOrder.note = request.body.note
    }
    if (request.body.phoneReceiver && request.body.phoneReceiver.length > 0) {
        updateOrder.phoneReceiver = request.body.phoneReceiver
    }
    if (request.body.weight && request.body.weight.length > 0) {
        updateOrder.weight = request.body.weight
    }
    if (request.body.status && request.body.status.length > 0) {
        updateOrder.status = request.body.status
    }
    if (request.body.prepayment && request.body.prepayment.length > 0) {
        updateOrder.prepayment = request.body.prepayment
    }
    if (request.body.feeShip && request.body.feeShip.length > 0) {
        updateOrder.feeShip = request.body.feeShip
    }
    if (request.body.priceOfWeight && request.body.priceOfWeight.length > 0) {
        updateOrder.priceOfWeight = request.body.priceOfWeight
    }
    if (request.body.priceOfOrderFragile && request.body.priceOfOrderFragile.length > 0) {
        updateOrder.priceOfOrderFragile = request.body.priceOfOrderFragile
    }
    if (request.body.overheads && request.body.overheads.length > 0) {
        updateOrder.overheads = request.body.overheads
    }
    if (request.body.stopTime && request.body.stopTime.length > 0) {
        updateOrder.stopTime = request.body.stopTime
    }
    if (request.body.isComplete && request.body.isComplete.length > 0) {
        updateOrder.isComplete = request.body.isComplete
    }
    if (request.body.shipperId && request.body.shipperId.length > 0) {
        updateOrder.shipperId = request.body.shipperId
    }
    updateOrder.stopTime = Date.now()
    return updateOrder
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