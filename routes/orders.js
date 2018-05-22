var express = require('express');
var router = express.Router();

const Order = require('../models/Order');
const User = require('../models/User');

/////// MARK : routes //////////

// MARK: Methods orderer

// post
router.post('/orderer/insert_new_order', function(request, response) {
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

// gets
router.get('/orderer/order_by_user', function(request, response, next) {
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

router.get('/orderer/order_complete', function(request, response, next) {
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

router.get('/orderer/order_by_orderId', function(request, response) {
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

router.get('/orderer/list_order_wait_response', function(request, response) {
    var conditions = {}
    if (request.query.userId) {
        const userId = request.query.userId
        Order.aggregate([{
            $match: { $and: [{ status: 1 }, { userId: userId }] }
        }, {
            $lookup: {
                from: "users",
                localField: "shipperId",
                foreignField: "uid",
                as: "shipperData"
            }
        }, {
            $unwind: "$shipperData"
        }, {
            $project: {
                "shipperData._id": 0,
                "shipperData.uid": 0,
                "shipperData.password": 0,
                "shipperData.isActive": 0,
                "shipperData.isShipper": 0,
                "shipperData.email": 0,
                "shipperData.imageUrl": 0,
                "shipperData.orders": 0
            }
        }]).exec(function(err, result) {
            if (err) {
                responseResult(false, response, "Error is " + err, {})
            } else {
                responseResult(true, response, "Query was successful", result)
            }
        })
    }
})

// puts
router.put('/orderer/agree_to_ship', function(request, response) {
    if (request.body.orderId && request.body.shipperId) {
        const orderId = request.body.orderId
        const shipperId = request.body.shipperId
        Order.update({
            $and: [{ orderId: orderId }, { shipperId: shipperId }]
        }, {
            $set: { status: 2, startTime: Date.now() } // had shipper 
        }, function(err, raw) {
            if (err) {
                responseResult(false, response, "Error is " + err, {})
            } else if (!raw) {
                responseResult(false, response, "Can not found that order", {})
            } else {
                responseResult(true, response, "Confirm completed", {})
            }
        })
    } else {
        responseResult(false, response, "order id or shipper id is null", {})
    }
})


router.put('/orderer/update_order', function(request, response) {
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

// delete
router.delete('/orderer/delete_order', function(request, response) {
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




// MARK: Methods for shipper

router.get('/shipper/list_order', function(require, response) {
    Order.aggregate([{
            $match: { status: 0 }
        }, {
            $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "uid",
                as: "userData"
            }
        }, {
            $unwind: "$userData"
        },
        {
            $project: {
                "userData._id": 0,
                "userData.uid": 0,
                "userData.password": 0,
                "userData.isActive": 0,
                "userData.isShipper": 0,
                "userData.email": 0,
                "userData.imageUrl": 0,
                "userData.name": 0
            }
        }
    ]).exec(
        function(err, data) {
            if (err) {
                responseResult(false, response, "Error " + err, {})
            } else {
                responseResult(true, response, "Query select was successful", data)
            }
        }
    )
})

// method get list order saved by shipper
router.get('/shipper/order_saved_by_shipper', function(request, response) {
    if (request.query.shipperId) {
        const shipperId = request.query.shipperId
            // find to get list order
        User.findOne({ uid: shipperId }, function(err, userData) {
            if (err) {
                responseResult(false, response, "Error is " + err, {})
            } else {
                // get list order by array order id 
                Order.aggregate([{
                        $match: {
                            $and: [{ orderId: { "$in": userData.orders } }, { isComplete: false }]
                        }
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "userId",
                            foreignField: "uid",
                            as: "userData"
                        }
                    },
                    {
                        $unwind: "$userData"
                    },
                    {
                        $project: {
                            "userData._id": 0,
                            "userData.uid": 0,
                            "userData.password": 0,
                            "userData.isActive": 0,
                            "userData.isShipper": 0,
                            "userData.email": 0,
                            "userData.imageUrl": 0,
                            "userData.name": 0
                        }
                    }
                ]).exec(function(err, orderData) {
                    if (err) {
                        responseResult(false, response, "Error is " + err, {})
                    } else {
                        responseResult(true, response, "Find query was successful", orderData)
                    }
                })
            }
        })

    } else {
        responseResult(false, response, "You must enter shipper id", {})
    }
})

router.get('/shipper/order_accepted_by_shipper', function(request, response) {
    if (request.query.shipperId) {
        const shipperId = request.query.shipperId
            // find list order has shipper 
        Order.aggregate([{
                $match: {
                    $and: [
                        { shipperId: shipperId },
                        { isComplete: false }
                    ]
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "uid",
                    as: "userData"
                }
            },
            {
                $unwind: "$userData"
            },
            {
                $project: {
                    "userData._id": 0,
                    "userData.uid": 0,
                    "userData.password": 0,
                    "userData.isActive": 0,
                    "userData.isShipper": 0,
                    "userData.email": 0,
                    "userData.imageUrl": 0,
                    "userData.name": 0
                }
            }
        ]).exec(function(err, orderData) {
            if (err) {
                responseResult(false, response, "Error is " + err, {})
            } else {
                responseResult(true, response, "Find query was successful", orderData)
            }
        })
    } else {
        responseResult(false, response, "You must pass shipper id to parameters")
    }
})

router.get('/shipper/list_order_completed', function(request, response) {
    if (request.query.shipperId) {
        const shipperId = request.query.shipperId
        Order.aggregate([{
                $match: { $and: [{ shipperId: shipperId }, { isComplete: true }] }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "uid",
                    as: "userData"
                }
            },
            {
                $unwind: "$userData"
            },
            {
                $project: {
                    "userData._id": 0,
                    "userData.uid": 0,
                    "userData.password": 0,
                    "userData.isActive": 0,
                    "userData.isShipper": 0,
                    "userData.email": 0,
                    "userData.imageUrl": 0,
                    "userData.name": 0
                }
            }
        ]).exec(function(err, orderData) {
            if (err) {
                responseResult(false, response, "Error is " + err, {})
            } else {
                responseResult(true, response, "Find query was successful", orderData)
            }
        })
    }

})

router.put('/shipper/cancel_order', function(request, response) {
    if (request.body.shipperId && request.body.orderId) {
        const shipperId = request.body.shipperId
        const orderId = request.body.orderId
        Order.findOne({
            $and: [
                { orderId: orderId },
                { shipperId: shipperId }
            ]
        }, function(err, orderData) {
            if (err) {
                responseResult("Error", response, "Error is " + err, {})
            } else if (orderData) {
                if (orderData.status == 2) {
                    // don't allow to cancel order
                    responseResult("DontAllow", response, "Your order accepted to ship by orderer", {})
                } else if (orderData.status == 1) {
                    // allow to cancel order
                    Order.update({
                        orderId: orderId
                    }, {
                        $set: { shipperId: "", status: 0 }
                    }, function(err, raw) {
                        if (err) {
                            responseResult("Error", response, "Error is " + err, {})
                        } else {
                            responseResult("AllowCancel", response, "You canceled order", {})
                        }
                    })
                }
            } else {
                responseResult("Error", response, "shipper id do not match shipper id of order", {})
            }
        })
    } else {
        responseResult("Error", response, "shipper id and order id is null", {})
    }
})


router.put('/shipper/accept_order', function(request, response) {
    if (request.body.shipperId && request.body.orderId) {
        const shipperId = request.body.shipperId
        const orderId = request.body.orderId

        Order.findOne({
            $and: [
                { orderId: orderId },
                { shipperId: "" },
                { status: 0 }
            ]
        }, function(err, orderData) {
            if (err) {
                responseResult("False", response, "Error is " + err, {})
            } else if (!orderData) {
                // order had shipper id 
                responseResult("WaitResponse", response, "An order has been placed by another shipper", {})
            } else {
                // order doesn't shipper 
                // execute update shipperId to order
                Order.update({
                    orderId: orderId
                }, {
                    $set: { shipperId: shipperId, status: 1 }
                }, function(err, raw) {
                    if (err) {
                        responseResult("False", response, "Error is " + err, {})
                    } else {
                        responseResult("Wait", response, "Accept request to orderer is successfully", {})
                    }
                })
            }
        })
    } else {
        responseResult("Error", response, "You must enter order id and shipper id", {})
    }
})


router.put('/shipper/completed_ship_order', function(request, response) {
    if (request.body.orderId) {
        const orderId = request.body.orderId
        Order.update({ orderId: orderId }, {
            $set: { isComplete: true }
        }, function(err, raw) {
            if (err) {
                responseResult(false, response, "Error is " + err, {})
            } else {
                responseResult(true, response, "finish", {})
            }
        })
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