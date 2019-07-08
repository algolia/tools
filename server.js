// server.js
var express = require('express');
var serveStatic = require('serve-static');
app = express();
app.use('/metaparams', serveStatic(__dirname + "/packages/metaparams/dist"));
app.use('/index-manager', serveStatic(__dirname + "/packages/index-manager/dist"));
var port = process.env.PORT || 80;
app.listen(port);
console.log('server started '+ port);
