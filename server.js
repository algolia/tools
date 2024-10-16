// server.js
const express = require("express");
const serveStatic = require("serve-static");
const history = require("./customHistory");

const app = express();

app.use((req, res, next) => {
    console.log("force https upgrade in production");
    if (process.env.NODE_ENV === "production") {
        if (req.headers["x-forwarded-proto"] !== "https") {
            console.log("redirecting to https");
            return res.redirect("https://" + req.headers.host + req.url);
        }
    }
    console.log("proceeding with https");
    return next();
});

app.use(
    history({
        rewrites: [
            {
                from: /^\/relevance-testing\/.*$/,
                to: "/relevance-testing/index.html",
            },
        ],
    })
);

const apps = [
    "css",
    "apps",
    "logs",
    "metaparams",
    "index-manager",
    "relevance-testing",
    "index-differ",
    "index-analyzer",
    "transform",
    "insights-ui",
];

apps.forEach((appName) => {
    const serveStaticFunc = serveStatic(
        __dirname + `/packages/${appName}/dist`
    );
    app.use(`/${appName}`, (req, res, next) => {
        console.log(`serving ${appName}`);
        const wrappedNext = () => {
            console.log(`fallthrough for ${appName}`);
            next();
        };
        serveStaticFunc(req, res, wrappedNext);
    });
});

const toolsInternalEndpoint =
    process.env.TOOLS_INTERNAL_ENDPOINT || "http://127.0.0.1:8090";
// Private
app.use("/infra-watch", (req, res) =>
    res.redirect(`${toolsInternalEndpoint}/infra-watch`)
);
app.use("/index-size", (req, res) =>
    res.redirect(`${toolsInternalEndpoint}/index-size`)
);
app.use("/dictionaries", (req, res) =>
    res.redirect(`${toolsInternalEndpoint}/dictionaries`)
);

app.use((req, res) => {
    console.log(
        "redirecting to apps on tools endpoint",
        process.env.TOOLS_ENDPOINT
    );
    res.redirect(`${process.env.TOOLS_ENDPOINT || ""}/apps`);
});

const port = process.env.PORT || 80;
app.listen(port);
console.log("server started http://localhost:" + port);
