const mongoose = require('mongoose')
    // create the schema object 
const Schema = mongoose.Schema


// create User model  
const UserSchema = new Schema({
    uid: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    imageUrl: { type: String, default: "" },
    phoneNumber: { type: String, default: "" },
    isActive: { type: Number, default: 0 }, // 0 = isActive
    isShipper: { type: Number, default: 0 }, // 1 = isShipper 
    orders: { type: [String], default: [] }
})

//// hashing a password before saving it to the database
UserSchema.pre('save', function(next) {
    var user = this
    bcrypt.hash(user.password, 10, function(err, hash) {
        if (err) {
            return next(err)
        }
        user.password = hash;
        next()
    })
})

var User = mongoose.model('User', UserSchema);
module.exports = User;