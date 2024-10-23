// logger.js

/**
 * Sends log data to the server's /log endpoint.
 *
 * @param {Object} logData - The log data to be sent.
 * @returns {Promise<void>}
 */
export async function sendLog(logData) {
    try {
        await fetch("/log", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(logData),
        });
    } catch (error) {
        console.error("Failed to send log:", error);
    }
}

/**
 * Redacts sensitive information from the API key.
 * It removes all but the first 4 characters and obfuscates the rest
 * with asterisks.
 *
 * @param {string} apiKey - The original API key.
 * @returns {string} - The redacted API key.
 */
export function redactApiKey(apiKey) {
    if (!apiKey) return "N/A";
    const ss = apiKey.substring(0, 4);
    const rest = apiKey.substring(4).replace(/./g, "*");
    return ss + rest;
}
