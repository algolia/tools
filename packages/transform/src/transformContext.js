import algoliasearch from "algoliasearch";
export default {
    algoliasearch: algoliasearch,
    getArrayValue: (val) => {
        if (Array.isArray(val)) return val;
        return [val];
    }
};
