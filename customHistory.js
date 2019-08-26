'use strict';

var url = require('url');

exports = module.exports = function historyApiFallback(options) {
    options = options || {};
    var logger = getLogger(options);

    console.log('ok1');

    return function(req, res, next) {
        var headers = req.headers;
        console.log('ok2');
        if (req.method !== 'GET') {
            console.log('ok3');
            logger(
                'Not rewriting',
                req.method,
                req.url,
                'because the method is not GET.'
            );
            return next();
        } else if (!headers || typeof headers.accept !== 'string') {
            console.log('ok4');
            logger(
                'Not rewriting',
                req.method,
                req.url,
                'because the client did not send an HTTP accept header.'
            );
            return next();
        } else if (headers.accept.indexOf('application/json') === 0) {
            console.log('ok5');
            logger(
                'Not rewriting',
                req.method,
                req.url,
                'because the client prefers JSON.'
            );
            return next();
        } else if (!acceptsHtml(headers.accept, options)) {
            console.log('ok6');
            logger(
                'Not rewriting',
                req.method,
                req.url,
                'because the client does not accept HTML.'
            );
            return next();
        }

        var parsedUrl = url.parse(req.url);
        var pathname = parsedUrl.pathname;
        var rewriteTarget;
        options.rewrites = options.rewrites || [];

        console.log('ok7');
        if (pathname.lastIndexOf('.') > pathname.lastIndexOf('/') &&
            options.disableDotRule !== true) {
            console.log('ok8');
            logger(
                'Not rewriting',
                req.method,
                req.url,
                'because the path includes a dot (.) character.'
            );
            return next();
        }

        for (var i = 0; i < options.rewrites.length; i++) {
            console.log('ok9' + ' ' + i);
            var rewrite = options.rewrites[i];
            var match = parsedUrl.pathname.match(rewrite.from);
            if (match !== null) {
                console.log('ok10' + ' ' + i);
                rewriteTarget = evaluateRewriteRule(parsedUrl, match, rewrite.to, req);

                if(rewriteTarget.charAt(0) !== '/') {
                    logger(
                        'We recommend using an absolute path for the rewrite target.',
                        'Received a non-absolute rewrite target',
                        rewriteTarget,
                        'for URL',
                        req.url
                    );
                }

                logger('Rewriting', req.method, req.url, 'to', rewriteTarget);
                req.url = rewriteTarget;
                return next();
            }
        }

        console.log('ok11');
        if (options.rewrites.length <= 0) {
            console.log('ok12');
            rewriteTarget = options.index || '/index.html';
            logger('Rewriting', req.method, req.url, 'to', rewriteTarget);
            req.url = rewriteTarget;
            return next();
        }
    };
};

function evaluateRewriteRule(parsedUrl, match, rule, req) {
    if (typeof rule === 'string') {
        return rule;
    } else if (typeof rule !== 'function') {
        throw new Error('Rewrite rule can only be of type string or function.');
    }

    return rule({
        parsedUrl: parsedUrl,
        match: match,
        request: req
    });
}

function acceptsHtml(header, options) {
    options.htmlAcceptHeaders = options.htmlAcceptHeaders || ['text/html', '*/*'];
    for (var i = 0; i < options.htmlAcceptHeaders.length; i++) {
        if (header.indexOf(options.htmlAcceptHeaders[i]) !== -1) {
            return true;
        }
    }
    return false;
}

function getLogger(options) {
    if (options && options.logger) {
        return options.logger;
    } else if (options && options.verbose) {
        return console.log.bind(console);
    }
    return function(){};
}
