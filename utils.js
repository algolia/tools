const redactApiKey = (apiKey) => {
    if (!apiKey) return "N/A";
    const ss = apiKey.substring(0, 4);
    const rest = apiKey.substring(4).replace(/./g, "*");
    return ss + rest;
};

const getObfuscatedIP = (req) => {
    const rip =
        req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
        req.connection.remoteAddress ||
        "Unknown";

    if (rip.includes(":")) {
        // IPv6 obfuscation: Replace the last part of the address
        return rip.replace(/([a-fA-F0-9:]+):([a-fA-F0-9]+)$/, "$1:*");
    } else {
        // IPv4 obfuscation: Replace the last octet
        return rip.replace(/(\d+)\.(\d+)\.(\d+)\.(\d+)/, "$1.$2.$3.*");
    }
};

module.exports = {
    redactApiKey,
    getObfuscatedIP,
};
