"use strict";

// Imports
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const HomeModel = require('./homeModel');
const LoginModel = require('../database/loginModel');
const Webhook = require('../app/webhook');

const connectionString = 'mongodb://localhost:27017';
   
function connectDatabase() {
    //mongoose.connect(connectionString, { useNewUrlParser: true })
    mongoose.connect(connectionString)
    .then( ()=> {
        console.log("CONNECTED to " + connectionString);
    })
    .catch((err) => {
        console.log('connection-error', err);
    });
}
    
/**
 * Disconnects from the database if there is an active connection.
 */
function disconnectDatabase() {
    mongoose.connection.close( (err)=> {
        if (err) console.error(err);
        else console.log("DISCONNECTED from " + connectionString);
    })
}

function saveNewHome(home) {
    return new Promise((resolve, reject) => {
        try {
            home = new HomeModel(home);
            findHome({user: home.user, name: home.name}).then( (existingHome) => {
                if (existingHome.value === null) {
                    home.save( (err, saved)=> {
                        if(err) reject({value: err, success: false});
                        findUser({user: home.user}, false)
                        .then( (user) => {
                            Webhook.postToCallback(user.value, saved);
                            resolve({value: saved, success: true});
                        })
                        .catch((error) => {
                            reject({value: "Webhook error", success: false});
                        });
                    })
                } else {
                    reject({value: "Home allready exist", success: false});
                }
            })
            .catch((error) => {
                reject({value: error, success: false});
            });
        } catch (error) {
            reject({value: error, success: false});
        }
    })
}

function updateHome(home, user) {
    return new Promise((resolve, reject) => {
        if (home.user !== user) {
            reject({value: "Forbidden", success: false});
        }
        try {
            new HomeModel(home);
        } catch (error) {
            reject({value: "Wrong schema error", success: false});
        }
        const options = {
            strict: false,
            upsert: false,
            setDefaultsOnInsert: true,
            useFindAndModify: false,
            new: true,
            overwrite: true
        };
        HomeModel.findOneAndUpdate({user: home.user, name: home.name}, home, options, (err, saved) => {
            if (saved === null) reject({value: "Home does not exist", success: false});
            if (err) reject({value: "Home does not exist", success: false});
            resolve({value: saved, success: true});
        });    
       
    })
}

function patchHome(home, user) {
    return new Promise((resolve, reject) => {
        if (home.user !== user) {
            reject({value: "Forbidden", success: false});
        }
        try {
            new HomeModel(home);
        } catch (error) {
            reject({value: "Wrong schema error", success: false});
        }
        const options = {
            strict: false,
            upsert: false,
            setDefaultsOnInsert: true, 
            useFindAndModify: false,
            new: true
        };

        HomeModel.findOneAndUpdate({user: home.user, name: home.name}, home, options, (err, saved) => {
            if (saved === null) reject({value: "Home does not exist", success: false});
            if (err) reject({value: "Home does not exist", success: false});
            resolve({value: saved, success: true});
        });     
    })
}
function deleteHome(home) {
    return new Promise((resolve, reject) => {
        findHome({"_id": home._id}).then((res) => {
            if (res.value.user !== home.user) reject({value: "Forbidden", success: false});
            HomeModel.deleteOne(home, (err, result) => {
                if (err) reject({value: "Home does not exist", success: false}); 
                resolve({value: home, success: true});
            }).catch((error) => {
                reject({value: error, success: false});
            });
        }).catch((error) => {
            reject({value: error, success: false});
        });
    })
    
}

function deleteHomes(homes) {
    return new Promise((resolve, reject) => {
        HomeModel.deleteMany(homes, (err, result) => {
            if (err) reject({value: "Home does not exist", success: false}); 
            resolve({value: homes, success: true});
        })
    })
}

/**
 * Finds a home in the database.
 */
function findHome(home) {
    return new Promise((resolve, reject) => {
        
        HomeModel.findOne(home)
        .then((home) => {
            resolve({value: home, success: true});
        })
        .catch((error) => {
            reject({value: "Home does not exist", success: false});
        });
    });
}

function findHomes(home) {
    return new Promise((resolve, reject) => {
        HomeModel.find(home)
        .then((homes) => {
            resolve({value: homes, success: true});
        })
        .catch((error) => {
            reject({value: "Home does not exist", success: false});
        });
    });
}

function dropCollection(collection1, collection2) {
    return new Promise((resolve, reject) => {
        mongoose.connection.db.dropCollection( collection1 )
        .then( (response) => {
        })
        .catch((error) => {
            //reject("Could not drop collection: \n" + error, false);
        });
        mongoose.connection.db.dropCollection( collection2 )
        .then( (response) => {
            resolve(response);
        })
        .catch((error) => {
            reject("Could not drop collection: \n" + error, false);
        });
    });
}

function saveNewUser(user) {
    return new Promise((resolve, reject) => {
        if(JSON.stringify(user.schema) !== JSON.stringify(LoginModel.schema)) {
            reject({value: "Wrong schema error", success: false});
        } 

        bcrypt.genSalt(10, function(err, salt) {
            if (err) {
                reject({value: "Internal server error", success: false});
            };

            bcrypt.hash(user.password, salt, function(err, hash) {
                if (err) {
                    reject({value: "Internal server error", success: false});
                };
                user.password = hash;

                findUser({user: user.user}, false).then( (existingUser) => {
                    if (existingUser.value === null) {
                        user.save( (err, saved)=> {
                            if(err) reject({value: err, success: false});
                            resolve({value: saved, success: true});
                        })
                    } else {
                        reject({value: "User allready exist", success: false});
                    }
                })
                .catch((error) => {
                    reject({value: error, success: false});
                });

            });
          });
        
    });
}

function findUser(usr, login) {
    return new Promise((resolve, reject) => {
        LoginModel.findOne({user: usr.user})
        .then((user) => {
            if (login) {
                bcrypt.compare(usr.password, user.password, function(err, res) {
                    if (err) reject({value: "Wrong username or password", success: false});
                    if (res === false) reject({value: "Wrong username or password", success: false});
                    else resolve({value: user, success: true});
                  });
            } else {
                resolve({value: user, success: true});
            }
        })
        .catch((error) => {
            reject({value: "Invalid user credentials", success: false});
        });
    });
}


module.exports = {
    connectDatabase,
    disconnectDatabase,
    saveNewHome,
    findHome,
    findHomes,
    updateHome,
    patchHome,
    dropCollection,
    saveNewUser,
    findUser,
    deleteHome,
    deleteHomes
}
