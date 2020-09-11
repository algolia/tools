// server.js
const express = require('express');
const serveStatic = require('serve-static');
const history = require('./customHistory');

const app = express();

const ua = require('universal-analytics')

app.use(function (req, res, next) {
    const visitor = ua('UA-32446386-39');

    const cookie = req.headers.cookie || '';
    if (req.url.length > 0 && cookie.includes('laravel_session') && !req.url.includes('css') && !req.url.includes('js')) {
        visitor.pageview({
            dp: req.url,
            dh: req.headers.host,
            uip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            ua: req.headers['user-agent'],
            dr: req.headers.referrer || req.headers.referer,
            de: req.headers['accept-encoding'],
            ul: req.headers['accept-language']
        }).send();
    }

    next();
});

app.use((req, res, next) => {
    if (process.env.NODE_ENV === 'production') {
        if (req.headers['x-forwarded-proto'] !== 'https') {
            return res.redirect('https://' + req.headers.host + req.url);
        }
        if (req.hostname === 'algolia-experimental.herokuapp.com') {
            return res.redirect(`https://tools.algolia.com${req.url}`);
        }
    }
    return next();
});

app.use(history({
    rewrites: [
        { from: /^\/relevance-testing\/.*$/, to: '/relevance-testing/index.html' },
    ]
}));


app.use('/css', serveStatic(__dirname + "/packages/css/dist"));
app.use('/apps', serveStatic(__dirname + "/packages/apps/dist"));
app.use('/logs', serveStatic(__dirname + "/packages/logs/dist"));
app.use('/metaparams', serveStatic(__dirname + "/packages/metaparams/dist"));
app.use('/index-manager', serveStatic(__dirname + "/packages/index-manager/dist"));
app.use('/perso-formula', serveStatic(__dirname + "/packages/perso-formula/dist"));
app.use('/relevance-testing', serveStatic(__dirname + "/packages/relevance-testing/dist"));
app.use('/index-differ', serveStatic(__dirname + "/packages/index-differ/dist"));
app.use('/index-analyzer', serveStatic(__dirname + "/packages/index-analyzer/dist"));
app.use('/dictionaries', serveStatic(__dirname + "/packages/dictionaries/dist"));
app.use('/index-size', serveStatic(__dirname + "/packages/index-size/dist"));
app.use('/infra-watch', serveStatic(__dirname + "/packages/infra-watch/dist"));
app.use('/transform', serveStatic(__dirname + "/packages/transform/dist"));
app.use('/insights-ui', serveStatic(__dirname + "/packages/insights-ui/dist"));
app.use('/mercari', serveStatic(__dirname + "/packages/mercari/dist"));
app.use('/v8', serveStatic(__dirname + "/packages/v8/dist"));
app.use('/attribute-proximity', serveStatic(__dirname + "/packages/attribute-proximity/dist"));

// Legacy
app.use('/mlock-alerts', (req, res) => res.redirect('/infra-watch'));
app.use('/busted', (req, res) => res.redirect('/infra-watch'));

app.use((req, res) => {
    res.redirect("https://tools.algolia.com/apps");
});

var port = process.env.PORT || 80;
app.listen(port);
console.log('server started http://localhost:'+ port);
