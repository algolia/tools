// server.js
var express = require('express');
var serveStatic = require('serve-static');
app = express();

function redirectUnmatched(req, res) {
    res.redirect("https://algolia-experimental.herokuapp.com/apps");
}

app.use('/apps', serveStatic(__dirname + "/packages/apps/dist"));
app.use('/logs', serveStatic(__dirname + "/packages/logs/dist"));
app.use('/metaparams', serveStatic(__dirname + "/packages/metaparams/dist"));
app.use('/index-manager', serveStatic(__dirname + "/packages/index-manager/dist"));
app.use('/perso-formula', serveStatic(__dirname + "/packages/perso-formula/dist"));
app.use(redirectUnmatched);

var port = process.env.PORT || 80;
app.listen(port);
console.log('server started '+ port);
