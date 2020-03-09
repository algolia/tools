import {isString} from "../utils/types";

const normalize = function (s) {
    return s.toLowerCase();
};

const tokenize = function (s) {
    return s.split(' ').map(normalize);
};

const intersect = function() { return [...arguments].reduce((acc, val) => { return acc.filter((elt) => { return val.indexOf(elt) > -1; }); }); };

const TrieNode = function (key) {
    this.key = key;
    this.values = [];
    this.children = {};
};

export default function (objects, searchableAttributes) {
    this.root = new TrieNode(null);

    this.addObject = function (obj, did) {
        if (obj === null) return;

        if (typeof obj === 'object' && obj.constructor === Object) {
            Object.keys(obj).forEach((key) => {
                if (searchableAttributes.length === 0 || searchableAttributes.indexOf(key) !== -1) {
                    this.addObject(obj[key], did);
                }
            });
            return;
        }

        if (Array.isArray(obj)) {
            obj.forEach((obj) => {
                this.addObject(obj, did);
            });
            return;
        }

        if (isString(obj)) {
            this.addString(obj, did);
        }
    };

    this.addString = function (string, did) {
        tokenize(string).forEach((token) => {
           this.addToken(token, did);
        });
    };

    this.addToken = function (string, did) {
        let node = this.root;

        for (let i = 0; i < string.length; i++) {
            if (!node.children[string[i]]) {
                node.children[string[i]] = new TrieNode(string[i]);
            }

            node = node.children[string[i]];

            if (node.values.length < 1000) {
                if (node.values.indexOf(did) !== -1) continue;
                node.values.push(did);
            }
        }
    };

    this.getIVForToken = function (query) {
        let node = this.root;
        for (let i = 0; i < query.length; i++) {
            if (node.children[query[i]]) {
                node = node.children[query[i]];
            } else {
                return [];
            }
        }

        return node.values;
    };


    this.search = function (query) {
        const tokens = tokenize(query);
        const IVs = tokens.map((token) => {
            return this.getIVForToken(token);
        });

        const resultsIDs = intersect(...IVs).slice(0, 1000);

        return resultsIDs.map((resultID) => {
             return objects[resultID];
        });
    };

    objects.forEach((obj, did) => {
        this.addObject(obj, did);
    });
};
