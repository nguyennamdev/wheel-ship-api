const mongoose = require('mongoose')
    // create the schema object 
const Schema = mongoose.Schema


// create order model 

const Order = new Schema({
    orderId: { type: String, required: true },
    userId: { type: String, required: true },
    originAddress: { type: String, required: true },
    destinationAddress: { type: String, required: true },
    originLocation: new Schema({
        lattitude: { type: Number },
        longtitude: { type: Number }
    }),
    destinationLocation: new Schema({
        lattitude: { type: Number },
        longtitude: { type: Number }
    }),
    distance: { type: Number, default: 0 },
    startTime: { type: Date, default: Date.now() },
    stopTime: { type: Date, default: Date.now() },
    isFragile: { type: Boolean, default: false },
    note: { type: String, default: "" },
    phoneReceiver: { type: String },
    weight: { type: String },
    status: { type: Number, default: 0 }, // 0 as wait, 1 as had shipper
    prepayment: { type: Number, default: 0 },
    feeShip: { type: Number, default: 0 },
    priceOfWeight: { type: Number, default: 0 },
    priceOfOrderFragile: { type: Number, default: 0 },
    overheads: { type: Number, default: 0 },
    isComplete: { type: Boolean, default: false },
    shipperId: { type: String, default: "" }
})

module.exports = mongoose.model('Order', Order);