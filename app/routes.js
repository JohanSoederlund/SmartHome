"use strict";

const Router = require("koa-router");
const ObjectID = require("mongodb").ObjectID;
const jwt = require('jsonwebtoken');
const kJwt = require('koa-jwt');
const decode = require('koa-jwt-decode');


const DatabaseManager = require("../database/databaseManager");
const HomeModel = require("../database/homeModel");
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
    ctx.body = {};
    ctx.response.status = 200;
    let user;
    let user2;
    let homes;
    await DatabaseManager.findUser({user: "Liza"}).then ( (res)=> {
        user = res;
    })
    await DatabaseManager.findUser({user: "Lars"}).then ( (res)=> {
        user2 = res;
    })
    await DatabaseManager.findHomes({}).then ( (res)=> {
        homes = res;
    })

    ctx.body = {
        user: user,
        user2: user2,
        homes: homes
    }
    /*
    ctx.body = {
      links: {login: "/login", register: "/register", homes: "/homes", home: "/homes/:id"}
    };
    */
});

router.get("/homes", decode({ secret: SECRET }), async function (ctx) {
    ctx.body = {};
    try {
        await DatabaseManager.findHomes({user: ctx.state.user.user})
        .then((homes) => {
            ctx.body.links = {login: "/login", register: "/register", homes: "/homes"};
            ctx.body.homes = homes.value;
            if (homes.success) {
                let i = 0;
                homes.value.forEach(element => {
                    i++;
                    ctx.body.links[element.name] = "/homes/" + element._id;
                });
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

router.post("/homes", decode({ secret: SECRET }), async function (ctx) {
    ctx.body = {};
    try {
        let home = ctx.request.body;
        home.user = ctx.state.user.user;
        home = new HomeModel(home);
        await DatabaseManager.saveNewHome(home)
        .then( (result) => {
            ctx.body.links = {login: "/login", register: "/register", homes: "/homes", home: "/homes/:id"};
            ctx.body.homes = result.value;
            if (result.success) {
                ctx.body.links[result.value.name] = "/homes/" + result.value._id;
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

router.delete("/homes", decode({ secret: SECRET }), async function (ctx) {
    ctx.body = {};
    try {
        await DatabaseManager.deleteHomes({user: ctx.state.user.user})
        .then((homes) => {
            ctx.body.homes = homes.value;
            ctx.body.links = {login: "/login", register: "/register", homes: "/homes", home: "/homes/:id"};
            if (homes.success) ctx.response.status = 200;
            else ctx.response.status = 400;
        })
    } catch (error) {
        ctx.response.status = 400;
        ctx.body = error;
    }
});
/*
router.head("/homes", decode({ secret: SECRET }), async function (ctx) {
    ctx.response.status = 400;
    ctx.body = {};
    
    try {
        await DatabaseManager.findHomes({user: ctx.state.user.user})
        .then((homes) => {
            ctx.body.links = {login: "/login", register: "/register", homes: "/homes", home: "/homes/:id"};
            if (homes.success ) {
                let i = 0;
                homes.forEach(element => {
                    i++;
                    ctx.body.links[element.name] = "/homes/" + element._id;
                });
                ctx.response.status = 200;
            } else {
                ctx.response.status = 400;
            }
        })
    } catch (error) {
        ctx.body = error;
    }
    
});
*/

router.get("/homes/:id", decode({ secret: SECRET }), async function (ctx) {
    ctx.body = {};
    try {
        await DatabaseManager.findHome({"_id": ObjectID(ctx.params.id)})
        .then((result) => {
            if (result.value === null) {
              ctx.response.status = 400;
              ctx.body = "Home does not exist";
            } 
            else if (result.value.user !== ctx.state.user.user) {
                ctx.response.status = 403;
                ctx.body = "This resource does not belong to you!";
            } else {
                ctx.body.links = {login: "/login", register: "/register", homes: "/homes", home: "/homes/:id"};
                ctx.body.homes = result.value;
                if (result.success) {
                    ctx.response.status = 200;
                    ctx.body.links[result.value.name] = "/homes/" + result.value._id;
                } else {
                    ctx.response.status = 400;
                }
            }
        }).catch ( (error)=> {
            ctx.response.status = 400;
            ctx.body = error;
        });
    } catch (error) {
        ctx.body = error;
    }
});

router.put("/homes/:id", decode({ secret: SECRET }), async function (ctx) {
    ctx.body = {};
    try {
        
        let home = ctx.request.body;
        await DatabaseManager.updateHome(home, ctx.state.user.user)
        .then( (result) => {
            ctx.body.links = {login: "/login", register: "/register", homes: "/homes", home: "/homes/:id"};
            ctx.body.homes = result.value;
            if (result.success) {
                ctx.body.links[result.value.name] = "/homes/" + result.value._id;
                ctx.response.status = 200;
            } else {
                ctx.response.status = 403;
            }
        }).catch ( (error)=> {
            if (error.value === "Forbidden") {
                ctx.response.status = 403;
                ctx.body = "This resource does not belong to you!";
            } else {
                ctx.response.status = 400;
                ctx.body = error;
            }
        });
    } catch (error) {
        ctx.response.status = 400;
        ctx.body = error;
    }
});

router.patch("/homes/:id", decode({ secret: SECRET }), async function (ctx) {
    ctx.body = {};
    try {
        let home = ctx.request.body;
        await DatabaseManager.patchHome(home, ctx.state.user.user)
        .then( (result) => {
            ctx.body.links = {login: "/login", register: "/register", homes: "/homes", home: "/homes/:id"};
            ctx.body.homes = result.value;
            if (result.success) {
                ctx.body.links[result.value.name] = "/homes/" + result.value._id;
                ctx.response.status = 200;
            } else {
                ctx.response.status = 400;
            }
        }).catch ( (error)=> {
            if (error.value === "Forbidden") {
                ctx.response.status = 403;
                ctx.body = "This resource does not belong to you!";
            } else {
                ctx.response.status = 400;
                ctx.body = error;
            }
        });
    } catch (error) {
        ctx.response.status = 400;
        ctx.body = error;
    }
});

router.delete("/homes/:id", decode({ secret: SECRET }), async function (ctx) {
    ctx.body = {};
    try {
        await DatabaseManager.deleteHome({"_id": ObjectID(ctx.params.id), user: ctx.state.user.user})
        .then((homes) => {
            ctx.body.links = {login: "/login", register: "/register", homes: "/homes", home: "/homes/:id"};
            ctx.body.homes = homes.value;
            if (homes.success) ctx.response.status = 200;
            else ctx.response.status = 400;
        }).catch ( (error)=> {
            if (error.value === "Forbidden") {
                ctx.response.status = 403;
                ctx.body = "This resource does not belong to you!";
            } else {
                ctx.response.status = 400;
                ctx.body = error;
            }
        });
    } catch (error) {
        ctx.response.status = 400;
        ctx.body = error;
    }
});

/*
router.head("/homes/:id", decode({ secret: SECRET }), async function (ctx) {
    ctx.body = {};
    try {
        await DatabaseManager.findHome({"_id": ObjectID(ctx.params.id)})
        .then((result) => {
            if (result.value.user !== ctx.state.user.user) {
                ctx.response.status = 403;
                ctx.body = "This resource does not belong to you!";
            } else {
                
            }
        });
        await DatabaseManager.findHome({"_id": ObjectID(ctx.params.id), user: ctx.state.user.user})
        .then((homes) => {
            ctx.body.links = {login: "/login", register: "/register", homes: "/homes", home: "/homes/:id"};
            if (homes.success ) {
                let i = 0;
                homes.forEach(element => {
                    i++;
                    ctx.body.links[element.name] = "/homes/" + element._id;
                });
                ctx.response.status = 200;
            } else {
                ctx.response.status = 403;
            }
        }).catch ( (error)=> {
            if (error.value === "Forbidden") {
                ctx.response.status = 403;
                ctx.body = "This resource does not belong to you!";
            } else {
                ctx.response.status = 400;
                ctx.body = error;
            }
        });
    } catch (error) {
        ctx.body = error;
    }
});
*/

router.post("/register", async function (ctx) {
    ctx.body = {};
    try {
        let user = {user: ctx.request.body.user, password: ctx.request.body.password, 
            token: jwt.sign({ user: ctx.request.body.user }, SECRET), webhookCallback: ctx.request.body.webhookCallback};
        user = new LoginModel(user);
        await DatabaseManager.saveNewUser(user)
        .then( (result) => {
            ctx.body.links = {login: "/login", register: "/register", homes: "/homes", home: "/homes/:id"};
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
    ctx.body = {};
    try {
        await DatabaseManager.findUser({user: ctx.request.body.user, password: ctx.request.body.password })
        .then( (result) => {
            ctx.body.links = {login: "/login", register: "/register", homes: "/homes", home: "/homes/:id"};
            if (result.success) {
                ctx.response.status = 200;
                ctx.body.token = result.value.token;
            } else {
                ctx.response.status = 401;
            }
        })
    } catch (error) {
        console.log(error);
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

//export default router;
module.exports = {
    router
}