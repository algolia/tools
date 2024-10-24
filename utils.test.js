/* eslint-disable no-undef */
const { redactApiKey } = require("./utils");

describe("redactApiKey", () => {
    it("should redact the API key", () => {
        expect(redactApiKey("1234567890")).toBe("1234******");
        expect(redactApiKey("123")).toBe("123");
    });

    it("should return 'N/A' if the API key is missing", () => {
        expect(redactApiKey(null)).toBe("N/A");
        expect(redactApiKey(undefined)).toBe("N/A");
        expect(redactApiKey("")).toBe("N/A");
    });
});
