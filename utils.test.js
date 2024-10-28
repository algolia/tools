/* eslint-disable no-undef */
const { redactApiKey, getObfuscatedIP } = require("./utils");

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

describe("getObfuscatedIP", () => {
    it("should obfuscate a valid IPv4 address from x-forwarded-for header", () => {
        const req = {
            headers: {
                "x-forwarded-for": "192.168.1.123",
            },
            connection: { remoteAddress: "10.0.0.1" },
        };

        const result = getObfuscatedIP(req);
        expect(result).toBe("192.168.1.*");
    });

    it("should obfuscate a valid IPv4 address from remoteAddress if x-forwarded-for is not present", () => {
        const req = {
            headers: {},
            connection: { remoteAddress: "10.0.0.1" },
        };

        const result = getObfuscatedIP(req);
        expect(result).toBe("10.0.0.*");
    });

    it("should obfuscate a valid IPv6 address from x-forwarded-for header", () => {
        const req = {
            headers: {
                "x-forwarded-for": "2001:0db8:85a3:0000:0000:8a2e:0370:7334",
            },
            connection: { remoteAddress: "fe80::1" },
        };

        const result = getObfuscatedIP(req);
        expect(result).toBe("2001:0db8:85a3:0000:0000:8a2e:0370:*");
    });

    it("should obfuscate a valid IPv6 address from remoteAddress if x-forwarded-for is not present", () => {
        const req = {
            headers: {},
            connection: { remoteAddress: "fe80::1" },
        };

        const result = getObfuscatedIP(req);
        expect(result).toBe("fe80::*");
    });

    it('should return "Unknown" if no IP is found in headers or connection', () => {
        const req = {
            headers: {},
            connection: {},
        };

        const result = getObfuscatedIP(req);
        expect(result).toBe("Unknown");
    });

    it("should handle multiple x-forwarded-for IPs by taking the first one for IPv4", () => {
        const req = {
            headers: {
                "x-forwarded-for": "192.168.1.123, 10.0.0.1",
            },
            connection: { remoteAddress: "172.16.0.1" },
        };

        const result = getObfuscatedIP(req);
        expect(result).toBe("192.168.1.*");
    });

    it("should handle multiple x-forwarded-for IPs by taking the first one for IPv6", () => {
        const req = {
            headers: {
                "x-forwarded-for": "2001:0db8:85a3::7334, fe80::1",
            },
            connection: { remoteAddress: "fe80::2" },
        };

        const result = getObfuscatedIP(req);
        expect(result).toBe("2001:0db8:85a3::*");
    });

    it('should return "Unknown" if an invalid x-forwarded-for header is present', () => {
        const req = {
            headers: {
                "x-forwarded-for": "",
            },
            connection: {},
        };

        const result = getObfuscatedIP(req);
        expect(result).toBe("Unknown");
    });
});
