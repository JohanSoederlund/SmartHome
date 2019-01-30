"use strict";

const axios = require('axios');
const DatabaseManager = require("../database/databaseManager");

function postToCallback(user, newHome) {
    axios.post(user.webhookCallback, {
        newHome: newHome
    })
    .then((res) => {
        console.log(`statusCode: ${res.statusCode}`)
        console.log(res)
    })
    .catch((error) => {
        console.error(error)
    })
}


module.exports = {
    postToCallback
}