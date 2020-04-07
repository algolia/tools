import sax from "sax";

export default function (userRootItem, onHit) {
    const parser = sax.parser(false);
    const rootItem = userRootItem.toLowerCase() || 'item';
    const stack = [];

    const getFinalNodeName = function (name) {
        const n = name.toLowerCase();
        if (n.startsWith('g:')) return n.slice(2);
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
                stack.push({_attrs: node.attributes});
            } else {
                stack.push({});
            }
        } else if (stack.length > 0) {
            const finalNodeName = getFinalNodeName(nodeName);
            const currentObject = stack[stack.length - 1];
            if (Object.keys(node.attributes).length > 0) {
                currentObject[finalNodeName] = {
                    _attrs: JSON.parse(JSON.stringify(node.attributes))
                };
            } else {
                currentObject[finalNodeName] = {};
            }
            stack.push(currentObject[finalNodeName]);
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
