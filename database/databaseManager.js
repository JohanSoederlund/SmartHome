"use strict";

// Imports
const mongoose =require('mongoose');
const DatabaseModel = require('../database/databaseModel');
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
        if(JSON.stringify(home.schema) !== JSON.stringify(DatabaseModel.schema)) {
            reject({value: "Wrong schema error", success: false});
        } 
        findHome({user: home.user, name: home.name}).then( (existingHome) => {
            if (existingHome.value === null) {
                home.save( (err, saved)=> {
                    if(err) reject({value: err, success: false});
                    findUser({user: home.user})
                    .then( (user) => {
                        Webhook.postToCallback(user.value, saved);
                        resolve({value: saved, success: true});
                    })
                    .catch((error) => {
                        console.log(error);
                    });
                })
            } else {
                reject({value: "Home allready exist: " + home, success: false});
            }
        })
        .catch((error) => {
            reject({value: error, success: false});
        });
    })
}

function updateHome(home) {
    return new Promise((resolve, reject) => {
        if(JSON.stringify(home.schema) !== JSON.stringify(DatabaseModel.schema)) {
            reject({value: "Wrong schema error", success: false});
        } 
        const options = {
            strict: false,
            upsert: false,
            setDefaultsOnInsert: true
        };
        findHome({user: home.user, name: home.name}).then( (existingHome) => {
            if (existingHome !== null) {
                DatabaseModel.findOneAndUpdate(existingHome, home, options, (err, saved) => {
                    if (err) reject({value: err, success: false});
                    resolve({value: saved, success: true});
                });              
            } else {
                reject({value: "Home does not exist: " + {user: home.user, name: home.name}, success: false});
            }
        })
        .catch((error) => {
            reject({value: error, success: false});
        });
    })
}

function patchHome(home) {
    return new Promise((resolve, reject) => {
        if(JSON.stringify(home.schema) !== JSON.stringify(DatabaseModel.schema)) {
            reject({value: "Wrong schema error", success: false});
        } 
        const options = {
            strict: false,
            upsert: false,
            setDefaultsOnInsert: true
        };
        findHome({user: home.user, name: home.name}).then( (existingHome) => {
            if (existingHome !== null) {
                let patchedHome = existingHome;
                if (typeof(home.lightbulbs) === "undefined") patchedHome.lightbulbs = home.lightbulbs;
                if (typeof(home.doors) === "undefined") patchedHome.doors = home.doors;
                if (typeof(home.windows) === "undefined") patchedHome.windows = home.windows;
                if (typeof(home.cars) === "undefined") patchedHome.cars = home.cars;
                if (typeof(home.computers) === "undefined") patchedHome.computers = home.computers;

                DatabaseModel.findOneAndUpdate(existingHome, patchedHome, options, (err, saved) => {
                    if (err) reject({value: err, success: false});
                    resolve({value: saved, success: true});
                });              
            } else {
                reject({value: "Home does not exist: " + {user: home.user, name: home.name}, success: false});
            }
        })
        .catch((error) => {
            reject({value: error, success: false});
        });
    })
}

function deleteHome(home) {
    return new Promise((resolve, reject) => {
        DatabaseModel.deleteOne(home)
        .then( (err, result) => {
            if (err) reject(err); 
            resolve({value: result, success: true});
        })
    })
    .catch((error) => {
        reject({value: error, success: false});
    });
}

function deleteHomes(homes) {
    return new Promise((resolve, reject) => {
        DatabaseModel.deleteMany(homes)
        .then( (err, result) => {
            if (err) reject(err); 
            resolve({value: result, success: true});
        })
    })
    .catch((error) => {
        reject({value: error, success: false});
    });
}

/**
 * Finds a home in the database.
 */
function findHome(home) {
    return new Promise((resolve, reject) => {
        DatabaseModel.findOne(home)
        .then((home) => {
            resolve({value: home, success: true});
        })
        .catch((error) => {
            reject({value: "Home does not exist: " + home, success: false});
        });
    });
}

function findHomes(home) {
    return new Promise((resolve, reject) => {
        DatabaseModel.find(home)
        .then((homes) => {
            resolve({value: homes, success: true});
        })
        .catch((error) => {
            reject({value: "Home does not exist: " + home, success: false});
        });
    });
}

function dropCollection(collection) {
    return new Promise((resolve, reject) => {
        mongoose.connection.db.dropCollection( collection )
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
        findUser({user: user.user, password: user.password}).then( (existingUser) => {
            console.log("EXISTINGUSER");
            console.log(existingUser);
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
}

function findUser(user) {
    return new Promise((resolve, reject) => {
        LoginModel.findOne(user)
        .then((user) => {
            resolve({value: user, success: true});
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
