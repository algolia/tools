const stringToPath = function (path) {
    if (typeof path !== 'string') return path;
    let output = [];

    path.split('.').forEach(function (item) {
        // Split to an array with bracket notation
        item.split(/\[([^}]+)\]/g).forEach(function (key) {
            if (key.length > 0) {
                output.push(key);
            }
        });
    });

    return output;
};

export function get(obj, path, def) {
    path = stringToPath(path);
    let current = obj;

    for (let i = 0; i < path.length; i++) {
        if (current[path[i]] === undefined) return def;
        current = current[path[i]];

        if (Array.isArray(current)) {
            current = current[current.length - 1];
        }
    }

    return current;
}