import {properHighlight} from "../../../utils/formatters";

export default {
    computed: {
        type: function () {
            if (!this.synonym.type) return 'synonym';
            return this.synonym.type.toLowerCase();
        },
        isSynonym: function () {
            return this.type === 'synonym';
        },
        isAltCorrection1: function () {
            return this.type === 'altcorrection1';
        },
        isAltCorrection2: function () {
            return this.type === 'altcorrection2';
        },
        isOneWaySynom: function () {
            return this.type === 'onewaysynonym';
        },
        isPlaceholder: function () {
            return this.type === 'placeholder';
        },
        input: function () {
            return this.synonym.input || this.synonym.word || this.synonym.placeholder || this.synonym.synonyms[0];
        },
        highlightInput: function () {
            if (this.synonym._highlightResult) {
                if (this.synonym._highlightResult.input) return properHighlight(this.synonym._highlightResult.input.value);
                if (this.synonym._highlightResult.word) return properHighlight(this.synonym._highlightResult.word.value);
                if (this.synonym._highlightResult.placeholder) return properHighlight(this.synonym._highlightResult.placeholder.value);
                return properHighlight(this.synonym._highlightResult.synonyms[0].value);
            }
            // Based on observations, the API always returns a _highlightResult
            // object, so this should never be reached.
            // For safety, we return the input value, with highlighting and html escaping.
            return properHighlight(this.input);
        },
        synonyms: function () {
            return this.synonym.corrections
                || this.synonym.replacements
                || (this.isSynonym ? this.synonym.synonyms.slice(1) : this.synonym.synonyms);
        },
        highlightSynonyms: function () {
            if (this.synonym._highlightResult) {
                if (this.synonym._highlightResult.corrections) return this.synonym._highlightResult.corrections.map((o) => properHighlight(o.value));
                if (this.synonym._highlightResult.replacements) return this.synonym._highlightResult.replacements.map((o) => properHighlight(o.value));
                if (this.isSynonym) {
                    return this.synonym._highlightResult.synonyms.slice(1).map((o) => properHighlight(o.value));
                } else {
                    return this.synonym._highlightResult.synonyms.map((o) => properHighlight(o.value));
                }
            }
            // Based on observations, the API always returns a _highlightResult
            // object, so this should never be reached.
            // For safety, we return the input value, with highlighting and html escaping.
            return this.synonyms.map((o) => properHighlight(o));
        }
    },
    methods: {
        properHighlight: properHighlight,
    }
}
