"use strict";

const Koa = require("koa");
const Router = require("koa-router");
const BodyParser = require("koa-bodyparser");
const logger = require('koa-logger');
const ObjectID = require("mongodb").ObjectID;
const helmet = require("koa-helmet");

const fs = require('fs');
const http2 = require('http2');

const DatabaseManager = require('../database/databaseManager');
const DatabaseModel = require('../database/databaseModel');

const app = new Koa();
const router = new Router();

//const sslify = require('koa-sslify').default; // factory with default options
//app.use(sslify());

app.use(BodyParser());
app.use(logger());
app.use(helmet());

//https://www.npmjs.com/package/koa2-cors
//Access-Control-Allow-Methods, GET, POST, PUT, DELETE, HEAD

const options = {
    key: fs.readFileSync('/home/johan/studier/1DV527/ssl/selfsigned.key'),
    cert: fs.readFileSync('/home/johan/studier/1DV527/ssl/selfsigned.crt'),
};

DatabaseManager.connectDatabase();
//DatabaseManager.disconnectDatabase();


router.get("/", async function (ctx) {
    let query = JSON.stringify(ctx.request.query);
    ctx.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, HEAD');
    ctx.set({accept: 'application/json'});
    ctx.body = {
      Home: "HOME"
    };
  
});

router.post("/", async function (ctx) {
    //if typeof(ctx.request.body) === object
    let body = JSON.stringify(ctx.request.body);
    let query = JSON.stringify(ctx.request.query);
    ctx.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, HEAD');
    ctx.set({accept: 'application/json'});
    ctx.body = {
        Home: "HOME"
    };
});

router.get("/homes", async function (ctx) {
    let query = JSON.stringify(ctx.request.query);
    ctx.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, HEAD');
    ctx.set({accept: 'application/json'});
    await DatabaseManager.findHomes({})
    .then((homes) => {
        ctx.body = homes;
    })
    
});

router.post("/homes", async function (ctx) {
    ctx.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, HEAD');
    ctx.set({accept: 'application/json'});
    let home;
    try {
        home = new DatabaseModel(ctx.request.body);
        await DatabaseManager.saveNewHome(home)
        .then( (saved) => {
            ctx.body = saved;
        });
    } catch (error) {
        ctx.body = error;
    }
    
});

//router.post("/homes", async function (ctx) {

router.get("/homes/:id", async function (ctx) {
    let query = JSON.stringify(ctx.request.query);
    ctx.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, HEAD');
    ctx.set({accept: 'application/json'});
    try {
        await DatabaseManager.findHome({"_id": ObjectID(ctx.params.id)})
        .then((homes) => {
            ctx.body = homes;
        })
    } catch (error) {
        ctx.body = error;
    }
});

router.post("/homes/:id", async function (ctx) {
    ctx.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, HEAD');
    ctx.set({accept: 'application/json'});
    try {
        let home = new DatabaseModel(ctx.request.body);
        await DatabaseManager.updateHome(home)
        .then( (saved) => {
            ctx.body = saved;
        });
    } catch (error) {
        ctx.body = error;
    }
    
});

app.use(router.routes()).use(router.allowedMethods(options));

app.listen(3000);

const server = http2.createSecureServer(options, app.callback());
server.listen(443);