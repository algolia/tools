// server.js
const express = require('express');
const serveStatic = require('serve-static');
const history = require('./customHistory');

const app = express();

app.use((req, res, next) => {
    if (process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] !== 'https') {
        return res.redirect('https://' + req.headers.host + req.url);
    } else
        return next();
});

app.use(history({
    rewrites: [
        { from: /^\/relevance-testing\/.*$/, to: '/relevance-testing/index.html' }
    ]
}));


app.use('/apps', serveStatic(__dirname + "/packages/apps/dist"));
app.use('/logs', serveStatic(__dirname + "/packages/logs/dist"));
app.use('/metaparams', serveStatic(__dirname + "/packages/metaparams/dist"));
app.use('/index-manager', serveStatic(__dirname + "/packages/index-manager/dist"));
app.use('/perso-formula', serveStatic(__dirname + "/packages/perso-formula/dist"));
app.use('/relevance-testing', serveStatic(__dirname + "/packages/relevance-testing/dist"));
app.use('/index-differ', serveStatic(__dirname + "/packages/index-differ/dist"));
app.use('/dictionaries', serveStatic(__dirname + "/packages/dictionaries/dist"));
app.use('/index-size', serveStatic(__dirname + "/packages/index-size/dist"));
app.use((req, res) => {
    res.redirect("https://algolia-experimental.herokuapp.com/apps");
});

var port = process.env.PORT || 80;
app.listen(port);
console.log('server started http://localhost:'+ port);
