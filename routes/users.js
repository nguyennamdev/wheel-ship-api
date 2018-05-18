var express = require('express');
var router = express.Router();

const User = require('../models/User')
const bcrypt = require('bcrypt-nodejs')

/////// MARK : routes ////////////

// create method post request 
router.post('/insert_new_user', function(request, response) {
    var conditions = {}
    if (request.body.uid && request.body.uid.length > 0) {
        conditions.uid = request.body.uid
        User.find(conditions).limit(1).exec(function(err, data) {
            if (err) {
                responseResult(false, response, "Query find failed. Error is " + err, {})
            } else {
                // if uid is exist, do not allows to insert 
                if (data.length > 0) {
                    responseResult(false, response, "User already", {})
                } else {
                    // create a user
                    const user = createAInstanceOfUser(request)

                    // insert user to db
                    insertNewUser(user, response)
                }
            }
        })
    } else {
        responseResult(false, response, "You must enter your uid", {})
    }
})

router.post('/login', function(request, response, next) {
    if (request.body.logEmail && request.body.logPassword) {
        const email = request.body.logEmail
        const password = request.body.logPassword
        User.findOne({ email: email })
            .exec(function(err, userData) {
                if (err) {
                    return responseResult(false, response, err, {})
                } else if (!userData) {
                    var err = new Error("User not found")
                    err.status = 401;
                    return responseResult(false, response, err, {})
                }
                if (password == userData.password) {
                    request.session.userId = userData.uid
                    User.findOne({ uid: request.session.userId }).exec(function(err, user) {
                        if (err) {
                            responseResult(false, response, err, {})
                            return
                        } else {
                            if (user == null) {
                                var err = new Error('Not authorized! Go back!')
                                responseResult(false, response, err, {})
                            } else {
                                responseResult(true, response, "profile", user)
                            }
                        }
                    })
                }
            })
    }
})

// GET for logout 
router.get('/logout', function(request, response, next) {
    if (request.session) {
        // delete session object
        request.session.destroy(function(err) {
            if (err) {
                responseResult(false, response, err, {})
                return
            } else {
                responseResult(true, response, "logouted", {})
            }

        })
    }
})

// MARK: Methods put
router.put('/update_phone_number', function(request, response) {
    var conditions = {}
    if (request.body.uid && request.body.uid.length > 0) {
        conditions.uid = request.body.uid
            // create user want to update
        if (request.body.phoneNumber && request.body.phoneNumber.length > 0) {
            const phoneNumber = request.body.phoneNumber
            User.findOneAndUpdate(conditions, { $set: { phoneNumber: phoneNumber } }, { new: true }, (err, updateUser) => {
                if (err) {
                    responseResult(false, response, "Can't update user. Error is " + err)
                } else { // if it find uid successful then to update
                    responseResult(true, response, "Update user was successful", updateUser)
                }
            })
        } else {
            responseResult(false, response, "failed", "you must enter your phone number")
        }
    } else {
        responseResult(false, response, "failed", "you must enter your uid")
    }
})

router.put('/update_user_name', function(request, response) {
    var conditions = {}
    if (request.body.uid && request.body.uid.length > 0) {
        conditions.uid = request.body.uid
            // create user want to update
        if (request.body.name && request.body.name.length > 0) {
            const name = request.body.name
            User.findOneAndUpdate(conditions, { $set: { name: name } }, { new: true }, (err, updateUser) => {
                if (err) {
                    responseResult(false, response, "Can't update user. Error is " + err)
                } else { // if it find uid successful then to update
                    responseResult(true, response, "Update user was successful", updateUser)
                }
            })
        } else {
            responseResult(false, response, "failed", "you must enter your user name")
        }
    } else {
        responseResult(false, response, "failed", "you must enter your uid")
    }
})

router.put('/update_password', function(request, response) {
    var conditions = {}
    if (request.body.uid && request.body.uid.length > 0) {
        conditions.uid = request.body.uid
        if (request.body.password && request.body.password.length > 0) {
            const password = request.body.password
            User.findOneAndUpdate(conditions, { $set: { password: password } }, { new: true }, (err, updateUser) => {
                if (err) {
                    responseResult(false, response, "Can't update user. Error is " + err)
                } else { // if it find uid successful then to update
                    responseResult(true, response, "Update password was successful", updateUser)
                }
            })
        } else {
            responseResult(false, response, "failed", "you must enter your password")
        }
    } else {
        responseResult(false, response, "failed", "you must enter your uid")
    }
})


router.delete('/delete_a_user', function(request, response) {
    var conditions = {}
    if (request.body.uid && request.body.uid.length > 0) {
        conditions.uid = request.body.uid
            // execute remove user in db
        User.findOneAndRemove(conditions, function(err, data) {
            if (err) {
                responseResult(false, response, "Can't delete user that. Error is " + err)
            } else { // if it find uid unsuccessful 
                responseResult(false, response, "Can't found uid")
            }
        })
    } else {
        responeFail(response, false, "you must enter your uid")
    }
})

////// MARK : method ////////////
function createAInstanceOfUser(request) {
    const newUser = {
        uid: request.body.uid,
        name: request.body.name,
        email: request.body.email,
        password: request.body.password,
        imageUrl: request.body.imageUrl,
        phoneNumber: request.body.phoneNumber,
        isActive: request.body.isActive,
        isShipper: request.body.isShipper
    }
    return newUser;
}


function insertNewUser(newUser, response) {
    User.create(newUser, function(error, data) {
        if (error) {
            responseResult(false, response, "Insert failed. Error is " + error, res)
        } else {
            responseResult(true, response, "Insert new user successfully", data)
        }
    })
}

function responseResult(result, response, message, data) {
    response.json({
        result: result,
        data: data,
        message: message
    })
}


module.exports = router