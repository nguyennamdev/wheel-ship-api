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
    status: { type: String, enum: ["wait", "hadShipper"], default: "wait" },
    prepayment: { type: Number, default: 0 },
    feeShip: { type: Number, default: 0 },
    overheads: { type: Number, default: 0 }
})

module.exports = mongoose.model('Order', Order);