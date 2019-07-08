function deepFlat(obj, parentProps, props) {
    for (let prop in obj) {
        if (prop === '_rankingInfo' || prop === '_highlightResult' || prop === '_snippetResult' || prop === 'objectID') continue;

        if (typeof obj[prop] === 'object') {
            deepFlat(obj[prop], [...parentProps, prop], props);
        } else {
            props[`${[...parentProps, prop].join('.')}`] = obj[prop];
        }
    }

    return props;
}

export default obj => deepFlat(obj, [], {});