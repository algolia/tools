import greenlet from 'greenlet';

export default greenlet((appId, apiKey, indexName, userId, signature) => new Promise(function (resolve, reject) {
    if (appId === 'MySuperApp' || appId.endsWith('.local') || appId.endsWith('.test')) {
        resolve([], {}, []);
        return;
    }

    const isObject = function (obj) {
        return Object.prototype.toString.call(obj) === '[object Object]';
    };

    const flatten = function (records) {
        const flattenObj = {};

        function flattenRecordRec(r, parentKey) {
            if (isObject(r)) {
                Object.keys(r).forEach(function(k) {
                    const newKey = parentKey.length <= 0 ? k : `${parentKey}.${k}`;
                    flattenRecordRec(r[k], newKey);
                });
            } else if (Array.isArray(r) && r.length > 0) {
                r.slice(0, 100).forEach(function (o) {
                    flattenRecordRec(o, parentKey);
                });
            } else {
                flattenObj[parentKey] = flattenObj[parentKey] || [];
                if (!Array.isArray(r)) { // Make sure the we don't have an empty array
                    if (flattenObj[parentKey].indexOf(r) === -1) {
                        flattenObj[parentKey].push(r);
                    }
                }
            }
        }

        records.forEach(function (record) {
            flattenRecordRec(record, '');
        });
        return flattenObj;
    };

    self.importScripts('https://cdn.jsdelivr.net/npm/algoliasearch@3.33.0/dist/algoliasearchLite.min.js');
    const client = algoliasearch(appId, apiKey);
    if (signature) {
        client.setExtraHeader('X-Algolia-Signature', signature);
    }
    if (userId) {
        client.setExtraHeader('X-Algolia-User-ID', userId);
    }
    const index = client.initIndex(indexName);
    index.search('', {
        page: 0,
        hitsPerPage: 1000,
        attributesToHighlight: [],
        attributesToSnippet: [],
    }).then((res) => {
        const records = res.hits;
        const flattenRecord = flatten(records);
        const keys = Object.keys(flattenRecord).filter((key) => {
            if (key.startsWith('_highlightResult')) return false;
            if (key.startsWith('_snippetResult')) return false;
            if (key.startsWith('_rankingInfo')) return false;
            if (key.startsWith('_distinctSeqID')) return false;
            return true;
        });

        resolve(Object.freeze({
            records,
            flattenRecord,
            keys
        }));
    });
}));

