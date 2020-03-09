export function isString(v) {
    return typeof v === 'string' || v instanceof String;
}

export function isObject(v) {
    return v && typeof v === 'object' && v.constructor === Object;
}

export function isBoolean(v) {
    return typeof v === "boolean";
}

export function isNumber(v) {
    return typeof v === "number";
}
