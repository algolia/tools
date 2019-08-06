const intersect = function() { return [...arguments].reduce((acc, val) => { return acc.filter((elt) => { return val.indexOf(elt) > -1; }); }); };

const Indexer = function () {
    this.tokens = {};

    this.tokenize = (string) => {
        return string.split(/\s/).map((s) => s.toLowerCase()).filter((val) => val);
    };

    this.addString = (string) => {
        this.tokenize(string).forEach((word) => {
            this.tokens[word] = this.tokens[word] || [];
            this.tokens[word].push(string);
        });
    };

    this.search = (query, nbhits) => {
        if (query.length <= 0) return Object.keys(this.tokens).slice(0, nbhits);
        const matchingStrings = this.tokenize(query).map((word) => {
            return Object.keys(this.tokens).reduce((acc, val) => {
                if (val.includes(word)) acc.push(...this.tokens[val]);
                return acc;
            }, []);
        });

        if (matchingStrings.length === 0) return [];

        return Array.from(new Set(intersect(...matchingStrings).slice(0, 50))).slice(0, nbhits).sort((a, b) => {
            if (a === query) return -1;
            if (b === query) return 1;
            return 0;
        });
    };
};

export default Indexer;