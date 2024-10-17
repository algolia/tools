// server.js
const express = require("express");
const serveStatic = require("serve-static");
const history = require("./customHistory");
const winston = require("winston");
const { combine, timestamp, json, errors } = winston.format;
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const app = express();

// =======================
// Logger Configuration
// =======================

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || "info",
    format: combine(errors({ stack: true }), timestamp(), json()),
    transports: [new winston.transports.Console({ handleExceptions: true })],
    exitOnError: false,
});

logger.stream = { write: (message) => logger.info(message.trim()) };

// =======================
// Body Parser & Request Logging
// =======================

app.use(express.json({ limit: "10kb" }));
app.use(morgan("combined", { stream: logger.stream }));

// =======================
// Rate Limiting
// =======================

// Can't exceed 100 logger requests within 1 minute
const logLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 100,
    message: {
        status: 429,
        error: "Too many logging requests from this IP, please try again after 1 minutes.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// =======================
// Log Endpoint
// =======================

const redactApiKey = (apiKey) =>
    apiKey ? apiKey.replace(/.(?=.{4})/g, "*") : "N/A";

const getRealIp = (req) =>
    req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
    req.connection.remoteAddress ||
    "Unknown";

app.post("/log", logLimiter, (req, res) => {
    const { action, user, appId, apiKey, status, responseSize } = req.body;

    if (!action || !appId || !apiKey || !status) {
        logger.warn("Incomplete log data received", {
            receivedData: JSON.stringify(req.body),
            ip: getRealIp(req),
            timestamp: new Date().toISOString(),
        });
        return res.status(400).json({ error: "Incomplete log data" });
    }

    const logMessage = {
        action,
        user,
        appId,
        apiKey: redactApiKey(apiKey),
        status,
        userAgent: req.headers["user-agent"] || "Unknown",
        ip: getRealIp(req),
        ...(responseSize && { responseSize }),
    };

    logger.info(logMessage);
    res.status(200).json({ message: "Log received" });
});

// =======================
// HTTPS Enforcement Middleware
// =======================

app.use((req, res, next) => {
    if (
        process.env.NODE_ENV === "production" &&
        req.headers["x-forwarded-proto"] !== "https" &&
        !req.secure
    ) {
        logger.info("Redirecting to HTTPS", {
            host: req.headers.host,
            url: req.url,
            ip: getRealIp(req),
            timestamp: new Date().toISOString(),
        });

        const validDomains = [
            process.env.TOOLS_ENDPOINT,
            process.env.TOOLS_INTERNAL_ENDPOINT,
        ];

        // Match the domain of the request header to the host and use the valid domain
        const requestedDomain = validDomains.find((domain) => {
            return req.headers.host.includes(domain);
        });

        // We intentionally exclude the url when upgrading to HTTPS to
        // prevent XSS vulnerabilities
        // see https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html#preventing-unvalidated-redirects-and-forwards
        return res.redirect(
            301,
            `https://${
                requestedDomain ||
                process.env.TOOLS_ENDPOINT ||
                "tools.algolia.com"
            }`
        );
    }
    next();
});

// =======================
// History API Fallback & Static Files
// =======================

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
    app.use(
        `/${appName}`,
        serveStatic(__dirname + `/packages/${appName}/dist`)
    );
});

// =======================
// Internal Tool Redirects
// =======================

const toolsInternalEndpoint =
    process.env.TOOLS_INTERNAL_ENDPOINT || "http://127.0.0.1:8090";
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
    res.redirect(`${process.env.TOOLS_ENDPOINT || ""}/apps`);
});

// =======================
// Start the Server
// =======================

const port = process.env.PORT || 80;
app.listen(port, () => {
    logger.info(`Server started on http://localhost:${port}`, {
        timestamp: new Date().toISOString(),
    });
});
