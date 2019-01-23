const Koa = require("koa");
const Router = require("koa-router");
const BodyParser = require("koa-bodyparser");
const logger = require('koa-logger');


const app = new Koa();
const router = new Router();

app.use(BodyParser());
app.use(logger());

router.get("/", async function (ctx) {
    let query = JSON.stringify(ctx.request.query);
    ctx.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, HEAD');
    ctx.set({accept: 'application/json'});
    ctx.body = {
      lightbulbs: [
        {kitchenLightbulb: {on: true, runtime: 65000}},
        {bedroomLightbulb: {on: false, runtime: 33000}},
    ]
    };
    ctx.headers = {accept: 'application/json'}
});

router.post("/", async function (ctx) {
    //if typeof(ctx.request.body) === object
    let body = JSON.stringify(ctx.request.body);
    let query = JSON.stringify(ctx.request.query);
    ctx.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, HEAD');
    ctx.set({accept: 'application/json'});
    ctx.body = {
      lightbulbs: [
        {kitchenLightbulb: {on: true, runtime: 65000}},
        {bedroomLightbulb: {on: false, runtime: 33000}},
    ]
    };
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(3000);