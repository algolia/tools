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
 *
 * @param {string} apiKey - The original API key.
 * @returns {string} - The redacted API key.
 */
export function redactApiKey(apiKey) {
    if (!apiKey) return "N/A";
    return apiKey.replace(/.(?=.{4})/g, "*"); // Redacts all but last 4 characters
}
