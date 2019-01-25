"use strict";

// Imports
const mongoose =require('mongoose');
const DatabaseModel = require('../database/databaseModel');


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
            console.log("Wrong schema error");
            reject("Wrong schema error");
        } 
        findHome({user: home.user, name: home.name}).then( (existingHome) => {
            if (existingHome === null) {
                home.save( (err, saved)=> {
                    if(err) reject(err);
                    resolve(saved);
                })
               
            } else {
                reject(home);
            }
        })
        .catch((error) => {
            reject(error);
        });
    })
}

function updateHome(home) {
    
    return new Promise((resolve, reject) => {
        if(JSON.stringify(home.schema) !== JSON.stringify(DatabaseModel.schema)) {
            console.log("Wrong schema error");
            reject("Wrong schema error");
        } 
        const options = {
            upsert: true,
            setDefaultsOnInsert: true
        };
        findHome({user: home.user, name: home.name}).then( (existingHome) => {
            if (existingHome !== null) {
                DatabaseModel.findByIdAndUpdate(home._id, home, options, (err, saved) => {
                    if (err) reject(err);
                    resolve(saved);
                });
               
            } else {
                reject("Home does not exist: " + {user: home.user, name: home.name});
            }
        })
        .catch((error) => {
            reject(error);
        });
    })
}

/**
 * Finds a home in the database.
 */
function findHome(home) {
    return new Promise((resolve, reject) => {
        DatabaseModel.findOne(home)
        .then((home) => {
            resolve(home);
        })
        .catch((error) => {
            reject("Home does not exist: " + home);
        });
    });
}

function findHomes(home) {
    return new Promise((resolve, reject) => {
        DatabaseModel.find(home)
        .then((homes) => {
            resolve(homes);
        })
        .catch((error) => {
            reject("Homes does not exist: " + home);
        });
    });
}

module.exports = {
    connectDatabase,
    disconnectDatabase,
    saveNewHome,
    findHome,
    findHomes,
    updateHome
}
