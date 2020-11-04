// server.js
const express = require('express');
const serveStatic = require('serve-static');
const history = require('./customHistory');

const app = express();

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

const apps = ['css', 'apps', 'logs', 'metaparams', 'index-manager', 'perso-formula', 'relevance-testing', 'index-differ', 'index-analyzer', 'dictionaries', 'index-size', 'infra-watch', 'transform', 'insights-ui', 'mercari', 'v8', 'attribute-proximity'];

apps.forEach((appName) => {
    const serveStaticFunc = serveStatic(__dirname + `/packages/${appName}/dist`);
    app.use(`/${appName}`, (req, res, next) => serveStaticFunc(req, res, next));
});

// Legacy
app.use('/mlock-alerts', (req, res) => res.redirect('/infra-watch'));
app.use('/busted', (req, res) => res.redirect('/infra-watch'));

app.use((req, res) => {
    res.redirect("https://tools.algolia.com/apps");
});

const port = process.env.PORT || 80;
app.listen(port);
console.log('server started http://localhost:'+ port);
