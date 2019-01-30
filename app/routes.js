"use strict";

const Router = require("koa-router");
const ObjectID = require("mongodb").ObjectID;
const jwt = require('jsonwebtoken');

const DatabaseManager = require("../database/databaseManager");
const DatabaseModel = require("../database/databaseModel");
const LoginModel = require("../database/loginModel");

/**
 * Change to node var in production
 */
const SECRET = "shared-secret";

const router = new Router();

/**
 * Every route below.
 */
router.get("/", async function (ctx) {
    ctx.response.status = 200;
    ctx.body = {
      Home: "HOME"
    };
    
});

router.get("/homes", async function (ctx) {
    try {
        await DatabaseManager.findHomes({user: ctx.state.user.user})
        .then((homes, success) => {
            ctx.body = homes.value;
            if (success) {
                ctx.response.status = 200;
            } else {
                ctx.response.status = 400;
            }
        })
    } catch (error) {
        ctx.response.status = 400;
        ctx.body = error;
    }
});

router.post("/homes", async function (ctx) {
    try {
        let home = ctx.request.body;
        home.user = ctx.state.user.user;
        home = new DatabaseModel(ctx.request.body);
        await DatabaseManager.saveNewHome(home)
        .then( (result) => {
            ctx.body = result.value;
            if (result.success) {
                ctx.response.status = 201;
            } else {
                ctx.response.status = 400;
            }
        });
    } catch (error) {
        ctx.response.status = 400;
        ctx.body = error;
    }
});

router.delete("/homes", async function (ctx) {
    try {
        await DatabaseManager.deleteHomes({"_id": ObjectID(ctx.params.id), user: ctx.state.user.user})
        .then((homes, success) => {
            ctx.body = homes;
            if (success) ctx.response.status = 200;
            else ctx.response.status = 400;
        })
    } catch (error) {
        ctx.response.status = 400;
        ctx.body = error;
    }
});

router.head("/homes", async function (ctx) {
    try {
        await DatabaseManager.findHomes({user: ctx.state.user.user})
        .then((homes, success) => {
            if (success ) {
                ctx.response.status = 200;
            } else {
                ctx.response.status = 403;
            }
        })
    } catch (error) {
        ctx.body = error;
    }
});

router.get("/homes/:id", async function (ctx) {
    try {
        await DatabaseManager.findHome({"_id": ObjectID(ctx.params.id), user: ctx.state.user.user})
        .then((homes, success) => {
            if (success ) {
                ctx.response.status = 200;
                ctx.body = homes;
            } else {
                ctx.response.status = 403;
            }
        })
    } catch (error) {
        ctx.body = error;
    }
});

router.put("/homes/:id", async function (ctx) {
    try {
        let home = ctx.request.body;
        home.user = ctx.state.user.user;
        home = new DatabaseModel(ctx.request.body);
        await DatabaseManager.updateHome(home)
        .then( (result) => {
            ctx.body = result.value;
            if (result.success) {
                ctx.response.status = 200;
            } else {
                ctx.response.status = 400;
            }
        });
    } catch (error) {
        ctx.response.status = 400;
        ctx.body = error;
    }
});

router.patch("/homes/:id", async function (ctx) {
    try {
        let home = ctx.request.body;
        home.user = ctx.state.user.user;
        home = new DatabaseModel(ctx.request.body);
        await DatabaseManager.patchHome(home)
        .then( (result) => {
            ctx.body = result.value;
            if (result.success) {
                ctx.response.status = 200;
            } else {
                ctx.response.status = 400;
            }
        });
    } catch (error) {
        ctx.response.status = 400;
        ctx.body = error;
    }
});

router.delete("/homes/:id", async function (ctx) {
    try {
        await DatabaseManager.deleteHome({"_id": ObjectID(ctx.params.id), user: ctx.state.user.user})
        .then((homes, success) => {
            ctx.body = homes;
            if (success) ctx.response.status = 200;
            else ctx.response.status = 400;
        })
    } catch (error) {
        ctx.response.status = 400;
        ctx.body = error;
    }
});

router.head("/homes/:id", async function (ctx) {
    try {
        await DatabaseManager.findHome({"_id": ObjectID(ctx.params.id), user: ctx.state.user.user})
        .then((homes, success) => {
            if (success ) {
                ctx.response.status = 200;
            } else {
                ctx.response.status = 403;
            }
        })
    } catch (error) {
        ctx.body = error;
    }
});

router.post("/register", async function (ctx) {
    try {
        let user = {user: ctx.request.body.user, password: ctx.request.body.password, 
            token: jwt.sign({ user: ctx.request.body.user }, SECRET), webhookCallback: ctx.request.body.webhookCallback};
        user = new LoginModel(user);
        await DatabaseManager.saveNewUser(user)
        .then( (result) => {
            ctx.body = result.value;
            if (result.success) {
                ctx.response.status = 201;
            } else {
                ctx.response.status = 400;
            }
        });
    } catch (error) {
        ctx.response.status = 400;
        ctx.body = error;
    }
});

router.post("/login", async function (ctx) {
    try {
        await DatabaseManager.findUser({user: ctx.request.body.user, password: ctx.request.body.password })
        .then( (result) => {
            if (result.success) {
                ctx.response.status = 200;
                ctx.body = {"token": result.value.token}
            } else {
                ctx.response.status = 401;
            }
        })
    } catch (error) {
        ctx.response.status = 401;
        ctx.body = error;
    }
});

/**
 * For development reasons, remove in production
 */
router.get("/drop", async function (ctx) {
    ctx.response.status = 307;
    let homes = "homes";
    let users = "logins";

    await DatabaseManager.dropCollection(users).then( (result) => {
        ctx.redirect('/homes');
    })
});

/**
 * For development reasons, remove in production
 */
router.get("/login", async function (ctx) {
    await DatabaseManager.findUser({})
    .then((result) => {
        ctx.response.status = 200;
        ctx.body = result.value;
    });
});

//export default router;
module.exports = {
    router
}