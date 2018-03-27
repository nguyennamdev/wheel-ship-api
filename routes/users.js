var express = require('express');
var router = express.Router();

const User = require('../models/User')

/////// MARK : routes ////////////

// create method post request 
router.post('/insert_new_user', function(request, response) {
    var conditions = {}
    if (request.body.uid && request.body.uid.length > 0) {
        conditions.uid = request.body.uid
        User.find(conditions).limit(1).exec(function(err, data) {
            if (err) {
                responseResult("Failed", response, "Query find is failed. Error is " + err, {})
            } else {
                // if uid is exist, do not allows to insert 
                if (data.length > 0) {
                    responseResult("Failed", response, "User is already", {})
                } else {
                    // create a user
                    const user = createAInstanceOfUser(request)

                    // insert user to db
                    insertNewUser(user, response)
                }
            }
        })
    } else {
        responseResult("Failed", response, "You must enter your uid", {})
    }

})

router.put('/update_a_user', function(request, response) {
    var conditions = {}
    if (request.body.uid && request.body.uid.length > 0) {
        conditions.uid = request.body.uid
            // create user want to update
        const newUser = createAInstanceOfUser(request)

        User.findOneAndUpdate(conditions, { $set: newUser }, { new: true }, (err, updateUser) => {
            if (err) {
                responseResult("Failed", response, "Can't update user. Error is " + err)
            } else if (updateUser == null) { // if it find uid unsuccessfu
                responseResult("Failed", response, "Can't found uid")
            } else { // if it find uid successful then to update
                responseResult("OK", response, "Update user is successfully", updateUser)
            }
        })
    } else {
        responseResult("Failed", response, "failed", "you must enter your uid")
    }
})


router.delete('/delete_a_user', function(request, response) {
    var conditions = {}
    if (request.body.uid && request.body.uid.length > 0) {
        conditions.uid = request.body.uid
            // execute remove user in db
        User.findOneAndRemove(conditions, function(err, data) {
            if (err) {
                responseResult("Failed", response, "Can't delete user that. Error is " + err)
            } else if (data != null) { // if it find uid successful then to delete
                responseResult("OK", response, "Deleted user successfully", data)
            } else { // if it find uid unsuccessful 
                responseResult("Failed", response, "Can't found uid")
            }
        })
    } else {
        responeFail(response, "failed", "you must enter your uid")
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
    return newUser
}

function insertNewUser(newUser, response) {
    User.create(newUser, function(error, data) {
        if (error) {
            responseResult("Failed", response, "Insert failed. Error is " + error, res)
        } else {
            responseResult("OK", response, "Insert new user successfully", data)
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


module.exports = router;