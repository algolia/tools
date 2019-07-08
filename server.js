// server.js
var express = require('express');
var path = require('path');
var serveStatic = require('serve-static');
app = express();
app.use('/metaparams', serveStatic(__dirname + "/metaparams/dist"));
var port = process.env.PORT || 80;
app.listen(port);
console.log('server started '+ port);
