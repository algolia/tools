const TrieNode = function (key) {
    this.key = key;
    this.values = [];
    this.children = {};

    this.getValues = function () {
        const values = [];
        const keys = Object.keys(this.children);

        values.push(...this.values);

        for (let i = 0; i < keys.length; i++) {
            if (keys[i] !== ' ') {
                values.push(...this.children[keys[i]].getValues());
            }
        }

        return values;
    };
};


export default function () {
    this.root = new TrieNode(null);

    this.addObject = function (string, obj) {
        let node = this.root;

        for (let i = 0; i < string.length; i++) {
            if (!node.children[string[i]]) {
                node.children[string[i]] = new TrieNode(string[i]);
            }

            node = node.children[string[i]];

            if (i === string.length - 1) {
                node.values.push(obj);
            }
        }
    };

    this.search = function (query) {
        let node = this.root;
        for (let i = 0; i < query.length; i++) {
            if (node.children[query[i]]) {
                node = node.children[query[i]];
            } else {
                return [];
            }
        }

        return node.getValues();
    }
};