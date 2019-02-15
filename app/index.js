"use strict";

const Koa = require("koa");
const BodyParser = require("koa-bodyparser");
const logger = require('koa-logger');
const helmet = require("koa-helmet");
const fs = require("fs");
const http2 = require("http2");
const kJwt = require('koa-jwt');

const DatabaseManager = require("../database/databaseManager");
const router = require("../app/routes");

const app = new Koa();

/**
 * Change to node var in production
 */
const SECRET =  process.env.SECRET;

/**
 * Todo: HATEOAS
 * const sslify = require('koa-sslify').default; // factory with default options
 * app.use(sslify());
 * https://www.npmjs.com/package/koa2-cors
 * let query = JSON.stringify(ctx.request.query);
 */

app.use(BodyParser());
app.use(logger());
app.use(helmet());

const options = {
    key: fs.readFileSync('/home/johan/studier/1DV527/ssl/selfsigned.key'),
    cert: fs.readFileSync('/home/johan/studier/1DV527/ssl/selfsigned.crt'),
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

const server = http2.createSecureServer(options, app.callback());

server.listen(process.env.PORT || 443);
