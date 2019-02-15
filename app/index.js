"use strict";

const Koa = require("koa");
const BodyParser = require("koa-bodyparser");
const logger = require('koa-logger');
const helmet = require("koa-helmet");
const kJwt = require('koa-jwt');

const DatabaseManager = require("../database/databaseManager");
const router = require("../app/routes");

const app = new Koa();

const SECRET =  process.env.SECRET;

/**
 * Todo: HATEOAS
 * https://www.npmjs.com/package/koa2-cors
 * let query = JSON.stringify(ctx.request.query);
 */

app.use(BodyParser());
app.use(logger());
app.use(helmet());

const options = {
};

DatabaseManager.connectDatabase();

// Custom 401 handling
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

app.use(kJwt({ secret: SECRET }).unless({ path: [/^\//, /^\/drop/, /^\/register/, /^\/login/] }));

app.use(async (ctx, next) => {
    ctx.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, HEAD');
    ctx.set({accept: 'application/json'});
    await next();
})

app.use(router.router.routes()).use(router.router.allowedMethods(options));

app.listen(process.env.PORT || 3000);
