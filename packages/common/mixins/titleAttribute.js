import {cleanAttributeName, cleanDeepAttributeName} from "../utils/formatters";

const isString = function (s) {
    return typeof s === 'string' || s instanceof String;
};

export default {
    watch: {
        titleAttribute: function () {
            this.$emit('onUpdateAutoTitleAttributeName', this.titleAttribute);
        }
    },
    props: ['titleAttributeName', 'autoTitleAttributeName'],
    computed: {
        titleAttribute: function () {
            let titleAttribute = this.titleAttributeName || this.autoTitleAttributeName;


            if (!titleAttribute && this.searchResponse) {
                const searchableAttributes = this.indexSettings.searchableAttributes || this.indexSettings.attributesToIndex || [];
                const hit = this.searchResponse.hits.length > 0 ? this.searchResponse.hits[0] : {};

                for (let i in searchableAttributes) {
                    const newTitleAttribute = cleanAttributeName(cleanDeepAttributeName(
                        searchableAttributes[i].split(',')[0]
                    ));
                    if (isString(hit[newTitleAttribute])) {
                        titleAttribute = newTitleAttribute;
                        break;
                    }
                }
            }

            return titleAttribute || 'objectID';
        },
    },
}
