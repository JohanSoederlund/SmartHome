"use strict";

const Koa = require("koa");
const Router = require("koa-router");
const BodyParser = require("koa-bodyparser");
const logger = require('koa-logger');
const ObjectID = require("mongodb").ObjectID;
const helmet = require("koa-helmet");

const fs = require("fs");
const http2 = require("http2");

var kJwt = require('koa-jwt');
var jwt = require('jsonwebtoken');

const DatabaseManager = require("../database/databaseManager");
const DatabaseModel = require("../database/databaseModel");
const LoginModel = require("../database/loginModel");

const app = new Koa();
const router = new Router();

const SECRET = "shared-secret";

//const sslify = require('koa-sslify').default; // factory with default options
//app.use(sslify());
//https://www.npmjs.com/package/koa2-cors
//let query = JSON.stringify(ctx.request.query);

app.use(BodyParser());
app.use(logger());
app.use(helmet());

const options = {
    key: fs.readFileSync('/home/johan/studier/1DV527/ssl/selfsigned.key'),
    cert: fs.readFileSync('/home/johan/studier/1DV527/ssl/selfsigned.crt'),
};

DatabaseManager.connectDatabase();
//DatabaseManager.disconnectDatabase();

// Custom 401 handling if you don't want to expose koa-jwt errors to users
app.use(function(ctx, next){
    return next().catch((err) => {
      if (401 == err.status) {
        ctx.status = 401;
        ctx.body = 'Protected resource, use Authorization header to get access\n';
      } else {
        throw err;
      }
    });
});

app.use(kJwt({ secret: SECRET }).unless({ path: [/^\/drop/, /^\/register/, /^\/login/] }));


app.use(async (ctx, next) => {
    ctx.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, HEAD');
    ctx.set({accept: 'application/json'});
    await next();
  })

router.get("/drop", async function (ctx) {
    ctx.response.status = 307;
    let homes = "homes";
    let users = "logins";

    await DatabaseManager.dropCollection(users).then( (result) => {
        console.log(result);
        ctx.redirect('/homes');
    })
});

router.get("/", async function (ctx) {
    ctx.response.status = 200;
    ctx.body = {
      Home: "HOME"
    };
  
});

router.post("/", async function (ctx) {
    //if typeof(ctx.request.body) === object
    ctx.body = {
        Home: "HOME"
    };
});



router.get("/homes", async function (ctx) {
    console.log("USER");
    console.log(ctx.state.user.user);
    console.log("END");
    console.log(ctx.request.token);
    await DatabaseManager.findHomes({user: ctx.state.user.user})
    .then((homes, success) => {
        ctx.response.status = 200;
        ctx.body = homes.value;
    })
    
});

router.post("/homes", async function (ctx) {
    let home;
    try {
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

});

router.head("/homes", async function (ctx) {

});

router.get("/homes/:id", async function (ctx) {
    let query = JSON.stringify(ctx.request.query);
    try {
        await DatabaseManager.findHome({"_id": ObjectID(ctx.params.id)})
        .then((homes, success) => {
            ctx.response.status = 200;
            ctx.body = homes;
        })
    } catch (error) {
        ctx.body = error;
    }
});

router.put("/homes/:id", async function (ctx) {
    try {
        let home = new DatabaseModel(ctx.request.body);
        await DatabaseManager.updateHome(home)
        .then( (result) => {
            console.log(result.value + "\n" + result.success);
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
    if (result.success) {
        ctx.response.status = 200;
    } else {
        ctx.response.status = 400;
    }
});

router.delete("/homes/:id", async function (ctx) {

});

router.head("/homes/:id", async function (ctx) {

});



router.post("/register", async function (ctx) {
    try {
        let user = {user: ctx.request.body.user, password: ctx.request.body.password, 
            token: jwt.sign({ user: ctx.request.body.user }, SECRET)};
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

router.get("/login", async function (ctx) {
    await DatabaseManager.findUser({})
    .then((result) => {
        console.log(result);
        ctx.response.status = 200;
        ctx.body = result.value;
    });
    //console.log(JSON.stringify(ctx.state));
});

router.post("/login", async function (ctx) {
    try {
        await DatabaseManager.findUser({user: ctx.request.body.user, password: ctx.request.body.password })
        .then( (result) => {
            console.log(JSON.stringify(result));
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

app.use(router.routes()).use(router.allowedMethods(options));

app.listen(3000);

const server = http2.createSecureServer(options, app.callback());
server.listen(443);