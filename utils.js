const redactApiKey = (apiKey) => {
    if (!apiKey) return "N/A";
    const ss = apiKey.substring(0, 4);
    const rest = apiKey.substring(4).replace(/./g, "*");
    return ss + rest;
};

module.exports = {
    redactApiKey,
};
