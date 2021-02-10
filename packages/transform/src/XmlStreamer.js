import sax from "sax";

export default function (userRootItem, onHit) {
    const parser = sax.parser(false);
    const rootItem = userRootItem.toLowerCase() || 'item';
    const stack = [];

    const getFinalNodeName = function (name) {
        const n = name.toLowerCase();
        if (n === 'value') return '_value';
        if (n.startsWith('g:') || n.startsWith('c:')) return n.slice(2);
        return n;
    };

    parser.ontext = (t) => {
        if (stack.length > 0) {
            const currentObject = stack[stack.length - 1];
            if (currentObject.value === undefined) {
                currentObject.value = '';
            }
            currentObject.value += t.trim();
        }
    };

    parser.oncdata = (t) => {
        if (stack.length > 0) {
            const currentObject = stack[stack.length - 1];
            if (currentObject.value === undefined) {
                currentObject.value = '';
            }
            currentObject.value += t;
        }
    };

    parser.onopentag = (node) => {
        const nodeName = node.name.toLowerCase();
        if (nodeName === rootItem) {
            if (Object.keys(node.attributes).length > 0) {
                stack.push({attrs: Object.keys(node.attributes).reduce((acc, key) => ({
                    ...acc,
                    [getFinalNodeName(key)]: node.attributes[key],
                }), {})});
            } else {
                stack.push({});
            }
        } else if (stack.length > 0) {
            const finalNodeName = getFinalNodeName(nodeName);
            let currentObject = stack[stack.length - 1];

            if (currentObject[finalNodeName] === undefined) {
                currentObject[finalNodeName] = {};
                currentObject = currentObject[finalNodeName];
            } else {
                if (!Array.isArray(currentObject[finalNodeName])) {
                    currentObject[finalNodeName] = [currentObject[finalNodeName]];
                }
                currentObject[finalNodeName].push({});
                currentObject = currentObject[finalNodeName][currentObject[finalNodeName].length - 1];
            }

            if (Object.keys(node.attributes).length > 0) {
                currentObject.attrs = Object.keys(node.attributes).reduce((acc, key) => ({
                    ...acc,
                    [getFinalNodeName(key)]: node.attributes[key],
                }), {});
            }

            stack.push(currentObject);
        }
    };

    parser.onclosetag = (n) => {
        if (stack.length > 0) {
            const object = stack.pop();
            if (stack.length === 0) {
                onHit(object);
            }
        }
    };

    return parser;
}
