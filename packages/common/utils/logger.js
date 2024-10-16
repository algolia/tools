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
        // Optionally, implement retry logic or alternative logging mechanisms here
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

/**
 * Constructs the log data object.
 *
 * @param {string} action - The action performed.
 * @param {string} outcome - The outcome of the action (e.g., 'success' or 'fail: reason').
 * @param {Object} user - The user information.
 * @param {number} responseSize - The size of the response in bytes.
 * @returns {Object} - The structured log data.
 */
export function constructLogData(action, outcome, user, responseSize = 0) {
    return {
        action,
        timestamp: new Date().toISOString(),
        outcome,
        user: {
            email: user.email || "Unknown",
            appId: user.appId || "Unknown",
            apiKey: redactApiKey(user.apiKey),
        },
        // Note: IP and User Agent are captured server-side based on the request
        responseSize: `${responseSize} bytes`,
    };
}
