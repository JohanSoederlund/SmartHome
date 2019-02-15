"use strict";

const axios = require('axios');

function postToCallback(user, newHome) {
    axios.post(user.webhookCallback, {
        newHome: newHome
    })
    .then((res) => {
        console.log(`statusCode: ${res.statusCode}`)
    })
    .catch((error) => {
        console.error(error)
    })
}

module.exports = {
    postToCallback
}