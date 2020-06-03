<template>
    <div>
        <div v-if="isComputing">
            <div class="p-16">
                {{isComputing ? 'computing': ''}}
                {{i}}/{{nbHits}} <span v-if="nbHits > 0">{{Math.floor(i*100/nbHits)}}%</span>
            </div>
            <div class="flex px-16">
                <div
                    @click="stopBrowsing = true"
                    class="cursor-pointer bg-white rounded border border-proton-grey-opacity-40 shadow-sm hover:shadow transition-fast-out px-16 p-8 text-sm relative group"
                >
                    Stop browsing
                </div>
            </div>
        </div>
        <div>
            <div class="flex text-xl p-16">
                <div v-if="attributeName.length === 0">All attributes</div>
                <div v-else
                     class="cursor-pointer text-nebula-blue hover:underline"
                     @click="$emit('onUpdateAttributeName', '')"
                >
                    All attributes
                </div>
                <template v-if="attributeName.length > 0" v-for="(part, i) in attributeParts">
                    <div>
                        <span>&nbsp;>&nbsp;</span>
                        <span
                            v-if="i < attributeParts.length - 1 || typeFilter.length !== 0 || valueFilter.length !== 0"
                            class="cursor-pointer text-nebula-blue hover:underline"
                            @click="$emit('onUpdateAttributeName', attributeParts.slice(0, i + 1).join('.'))"
                        >{{part}}</span>
                        <span v-else>{{part}}</span>
                    </div>
                </template>
                <div v-if="typeFilter">&nbsp:
                    <span
                        v-if="valueFilter.length !== 0"
                        class="cursor-pointer text-nebula-blue hover:underline"
                        @click="$emit('onUpdateValueFilter', '')"
                    >{{typeFilter}}</span>
                    <span v-else>{{typeFilter}}</span>
                </div>
                <div v-if="valueFilter">&nbsp;: {{valueFilter}}</div>
            </div>
            <div class="ml-16">
                <div
                    v-if="!isComputing && data"
                    class="flex"
                >
                    <div
                        class="flex items-center rounded border px-16 py-12"
                        :class="data.isSampled ? 'border-saturn-4 bg-saturn-4-opacity-40 text-saturn-1' : 'border-neptune-4-opacity-50 bg-nebula-blue-opacity-10 text-solstice-blue'"
                    >
                        <div v-if="data.isSampled">
                            The metrics have been computed on a subset of
                            {{i}} records out of {{nbHits}} ({{Math.floor(i*100/nbHits)}}%)
                        </div>
                        <div v-else>
                            The metrics have been computed on the full dataset: {{nbHits}} records
                        </div>
                        <div
                            v-if="data.isSampled"
                            @click="compute(false)"
                            class="ml-24 cursor-pointer bg-white rounded border border-proton-grey-opacity-40 shadow-sm hover:shadow transition-fast-out px-16 p-8 text-sm relative group"
                        >
                            Load all
                        </div>
                    </div>
                </div>
            </div>
            <div v-if="data" class="p-16">
                <types :app-id="appId" :index-name="indexName" :data="data" :type-filter="typeFilter" :attribute-name="attributeName" v-on="$listeners" />
                <object-keys :app-id="appId" :index-name="indexName" :data="data" :attribute-name="attributeName" :attributes="attributes" v-on="$listeners" />
                <boolean-values :data="data" :attribute-name="attributeName" :value-filter="valueFilter" v-on="$listeners" />
                <numeric-values :app-id="appId" :index-name="indexName" :data="data" :attribute-name="attributeName" :type-filter="typeFilter" :value-filter="valueFilter" v-on="$listeners" />
                <string-values :app-id="appId" :index-name="indexName" :data="data" :attribute-name="attributeName" :type-filter="typeFilter" :value-filter="valueFilter" v-on="$listeners" />
                <hits :data="data" :attribute-parts="attributeParts" v-on="$listeners" />
            </div>
        </div>
        </div>
</template>

<script>
    import {getSearchIndex} from "common/utils/algoliaHelpers";
    import {getRaw} from "common/utils/objectHelpers";
    import {isBoolean, isNumber, isObject, isString} from "common/utils/types";
    import ValuesList from "./analyzers/ValuesList";
    import Hits from "./analyzers/Hits";
    import StringValues from "./analyzers/StringValues";
    import NumericValues from "./analyzers/NumericValues";
    import BooleanValues from "./analyzers/BooleanValues";
    import Types from "./analyzers/Types";
    import ObjectKeys from "./analyzers/ObjectKeys";

    export default {
        name: 'Metrics',
        components: {ObjectKeys, Types, BooleanValues, NumericValues, StringValues, Hits, ValuesList},
        props: ['appId', 'indexName', 'attributeName', 'attributes', 'valueFilter', 'typeFilter'],
        data: function () {
            return {
                isComputing: false,
                sampleLimit: 1000,
                stopBrowsing: false,
                i: 0,
                nbHits: 0,
                cached: {},
            }
        },
        created: function () {
            this.compute(true);
        },
        watch: {
            appId: function () { this.compute(true) },
            indexName: function () { this.compute(true) },
            attributeName: function () { this.compute(true) },
            valueFilter: function () { this.compute(true) },
            typeFilter: function () { this.compute(true) },
        },
        computed: {
            key: function () {
                return `${this.appId}-${this.indexName}-${this.attributeName}-${this.typeFilter}-${this.valueFilter}`;
            },
            data: {
                get () {
                    return this.cached[this.key];
                },
                set (data) {
                    this.$set(this.cached, this.key, data);
                }
            },
            apiKey: function () {
                return this.$store.state.apps[this.appId] ? this.$store.state.apps[this.appId].key : '';
            },
            attributeParts: function () {
                return this.attributeName.split('.');
            },
            valueFilterForComparison: function () {
                return this.valueFilter === '<empty>' ? '' : this.valueFilter;
            }
        },
        methods: {
            compute: async function (enableSample) {
                if (this.data && (enableSample || !this.data.isSampled)) return;

                this.$root.$emit('onShouldPauseProxy');
                this.isComputing = true;
                this.stopBrowsing = false;

                const index = await getSearchIndex(this.appId, this.apiKey, this.indexName);

                const data = {
                    isSampled: false,
                    readNbHits: 0,
                    matchingNbHits: 0,
                    type: {
                        undefined: 0,
                        numeric: 0,
                        boolean: 0,
                        null: 0,
                        string: 0,
                        array: 0,
                        object: 0,
                    },
                    sortedTypes: [],
                    values: {
                        numericValues: [],
                        numericSortedValues: [],
                        numericUniqueValueWithCount: {},
                        stringUniqueValuesWithCount: {},
                        averageStringCountValues: 0,
                        stringCount: 0,
                        sumLength: 0,
                        sumNbWords: 0,
                        averageLength: 0,
                        averageNbWords: 0,
                    },
                    numerics: {
                        min: null,
                        max: null,
                        mean: null,
                        p1: null,
                        p25: null,
                        median: null,
                        p75: null,
                        p99: null,
                        sum: null,
                    },
                    boolean: {
                        true: 0,
                        false: 0,
                    },
                    object: {
                        sortedKeys: [],
                        keysUniqueWithCount: {},
                        typesPerAttribute: {},
                    },
                    recordsMatching: [],
                };

                const shouldProcessUndefined = this.typeFilter.length === 0 || this.typeFilter === 'undefined';
                const shouldProcessNumber = this.typeFilter.length === 0 || this.typeFilter === 'numeric';
                const shouldProcessObject = this.typeFilter.length === 0 || this.typeFilter === 'object';
                const shouldProcessBoolean = this.typeFilter.length === 0 || this.typeFilter === 'boolean';
                const shouldProcessNull = this.typeFilter.length === 0 || this.typeFilter === 'null';
                const shouldProcessString = this.typeFilter.length === 0 || this.typeFilter === 'string';
                const shouldProcessArray = this.typeFilter.length === 0 || this.typeFilter === 'array' || shouldProcessString || shouldProcessNumber;

                const processHit = (hit) => {
                    const value = getRaw(hit, this.attributeName);
                    const shouldProcessValue = this.valueFilter.length === 0 || this.valueFilterForComparison === (value !== undefined ? value.toString() : NaN);

                    data.readNbHits++;

                    // types
                    if (shouldProcessUndefined && value === undefined && shouldProcessValue) {
                        if (this.typeFilter === 'undefined' && data.recordsMatching.length < 10) data.recordsMatching.push(hit.objectID);
                        data.matchingNbHits++;
                        data.type.undefined++;
                    } else if (shouldProcessNumber && isNumber(value) && shouldProcessValue) {
                        if (data.recordsMatching.length < 10) data.recordsMatching.push(hit.objectID);
                        data.matchingNbHits++;
                        data.type.numeric++;
                        data.values.numericValues.push(value);
                        data.numerics.sum += value;
                        data.values.numericUniqueValueWithCount[value] = data.values.numericUniqueValueWithCount[value] || 0;
                        data.values.numericUniqueValueWithCount[value]++;
                    } else if (shouldProcessArray && Array.isArray(value)) {
                        let shouldCount = this.valueFilter.length === 0;

                        value.forEach((v) => {
                            const shouldProcessValueInner = this.valueFilter.length === 0 || this.valueFilterForComparison === (v !== undefined ? v.toString() : NaN);
                            if (isNumber(v) && shouldProcessValueInner) {
                                shouldCount = true;
                                data.values.numericUniqueValueWithCount[v] = data.values.numericUniqueValueWithCount[v] || 0;
                                data.values.numericUniqueValueWithCount[v]++;
                            }
                            if (isString(v) && shouldProcessValueInner) {
                                shouldCount = true;
                                data.values.stringUniqueValuesWithCount[v] = data.values.stringUniqueValuesWithCount[v] || 0;
                                data.values.stringUniqueValuesWithCount[v]++;
                                data.values.sumLength += v.toString().length;
                                data.values.sumNbWords += v.toString().split(' ').length;
                                data.values.stringCount++;
                            }
                        });

                        if (shouldCount) {
                            if (data.recordsMatching.length < 10) data.recordsMatching.push(hit.objectID);
                            data.matchingNbHits++;
                            data.type.array++;
                        }
                    } else if (shouldProcessObject && isObject(value)) {
                        if (data.recordsMatching.length < 10) data.recordsMatching.push(hit.objectID);
                        data.matchingNbHits++;
                        data.type.object++;

                        Object.keys(value).forEach((v) => {
                            data.object.keysUniqueWithCount[v] = data.object.keysUniqueWithCount[v] || 0;
                            data.object.keysUniqueWithCount[v]++;

                            if (data.object.typesPerAttribute[v] === undefined) {
                                data.object.typesPerAttribute[v] = {
                                    type: {undefined: 0, numeric: 0, array: 0, object: 0, boolean: 0, null: 0, string: 0},
                                    sortedTypes: [],
                                }
                            }
                            const subV = getRaw(hit, `${this.attributeName}.${v}`);
                            if (subV === undefined) data.object.typesPerAttribute[v].type.undefined++;
                            if (isNumber(subV)) data.object.typesPerAttribute[v].type.numeric++;
                            if (Array.isArray(subV)) data.object.typesPerAttribute[v].type.array++;
                            if (isObject(subV)) data.object.typesPerAttribute[v].type.object++;
                            if (isBoolean(subV)) data.object.typesPerAttribute[v].type.boolean++;
                            if (subV === null) data.object.typesPerAttribute[v].type.null++;
                            if (isString(subV)) data.object.typesPerAttribute[v].type.string++;
                        });
                    } else if (shouldProcessBoolean && value === true && shouldProcessValue) {
                        if (data.recordsMatching.length < 10) data.recordsMatching.push(hit.objectID);
                        data.matchingNbHits++;
                        data.type.boolean++;
                        data.boolean.true++;
                    } else if (shouldProcessBoolean && value === false && shouldProcessValue) {
                        if (data.recordsMatching.length < 10) data.recordsMatching.push(hit.objectID);
                        data.matchingNbHits++;
                        data.type.boolean++;
                        data.boolean.false++;
                    } else if (shouldProcessNull && value === null && shouldProcessValue) {
                        if (data.recordsMatching.length < 10) data.recordsMatching.push(hit.objectID);
                        data.matchingNbHits++;
                        data.type.null++;
                    } else if (shouldProcessString && isString(value) && shouldProcessValue) {
                        if (data.recordsMatching.length < 10) data.recordsMatching.push(hit.objectID);
                        data.matchingNbHits++;
                        data.type.string++;
                        data.values.stringCount++;
                        data.values.stringUniqueValuesWithCount[value] = data.values.stringUniqueValuesWithCount[value] || 0;
                        data.values.stringUniqueValuesWithCount[value]++;
                        data.values.sumLength += value.length;
                        data.values.sumNbWords += value.toString().split(' ').length;
                    } else {
                        if (this.typeFilter.length === 0 && this.valueFilter.length === 0) {
                            console.log('Unknown type', value);
                        }
                    }
                };

                const attributesToRetrieve = this.attributeName.length === 0 ? ['*'] : [this.attributeName];
                let res = await index.customBrowse({query: '', attributesToRetrieve: attributesToRetrieve});
                this.nbHits = res.nbHits;
                res.hits.forEach((hit) => processHit(hit));
                this.i = data.readNbHits;

                if (!enableSample || data.readNbHits < this.sampleLimit) {
                    while (res.cursor && !this.stopBrowsing) {
                        res = await index.customBrowse({cursor: res.cursor});
                        res.hits.forEach((hit) => processHit(hit));
                        this.i = data.readNbHits;

                        if (enableSample && data.readNbHits >= this.sampleLimit) {
                            break;
                        }
                    }
                }

                data.isSampled = (res.cursor !== undefined);

                if (data.readNbHits > 0) {
                    // Numeric final computations
                    data.values.numericValues.sort((a, b) => a - b);
                    data.numerics.min = data.values.numericValues[0];
                    data.numerics.max = data.values.numericValues[data.values.numericValues.length - 1];
                    data.numerics.mean = data.numerics.sum / data.type.numeric;
                    data.numerics.p1 = data.values.numericValues[Math.floor(1 / 100 * data.values.numericValues.length)];
                    data.numerics.p25 = data.values.numericValues[Math.floor(25 / 100 * data.values.numericValues.length)];
                    data.numerics.median = data.values.numericValues[Math.floor(50 / 100 * data.values.numericValues.length)];
                    data.numerics.p75 = data.values.numericValues[Math.floor(75 / 100 * data.values.numericValues.length)];
                    data.numerics.p99 = data.values.numericValues[Math.floor(99 / 100 * data.values.numericValues.length)];

                    // String final computations
                    let sum = 0;
                    for (let key in data.values.stringUniqueValuesWithCount) sum += data.values.stringUniqueValuesWithCount[key];
                    data.values.averageStringCountValues = sum / Object.keys(data.values.stringUniqueValuesWithCount).length;
                    data.values.averageLength = (data.values.sumLength / data.values.stringCount).toFixed(2);
                    data.values.averageNbWords = (data.values.sumNbWords / data.values.stringCount).toFixed(2);

                    // types
                    data.sortedTypes = Object.keys(data.type).filter((t) => {
                        if (this.typeFilter.length === 0) return true;
                        if (t === 'array' && ['numeric', 'string', 'array'].includes(this.typeFilter)) return true;
                        return this.typeFilter === t;
                    });
                    data.sortedTypes.sort((a, b) => data.type[b] - data.type[a]);

                    // type per sub attribute
                    Object.keys(data.object.typesPerAttribute).forEach((attribute) => {
                        data.object.typesPerAttribute[attribute].sortedTypes = Object.keys(data.object.typesPerAttribute[attribute].type).filter((t) => {
                            return data.object.typesPerAttribute[attribute].type[t] > 0;
                        });
                        data.object.typesPerAttribute[attribute].sortedTypes.sort((a, b) => {
                            return data.object.typesPerAttribute[attribute].type[b] - data.object.typesPerAttribute[attribute].type[a]
                        });
                    });

                    // keys
                    data.object.sortedKeys = Object.keys(data.object.keysUniqueWithCount);
                    data.object.sortedKeys.sort((a, b) => {
                        if (data.object.keysUniqueWithCount[b] !== data.object.keysUniqueWithCount[a]) {
                            return data.object.keysUniqueWithCount[b] - data.object.keysUniqueWithCount[a];
                        }
                        return a.localeCompare(b);
                    });
                }

                if (data.recordsMatching.length > 0) {
                    data.recordsMatching = (await index.getObjects(data.recordsMatching, {attributesToRetrieve: ['*']})).results;
                }

                this.data = Object.freeze(data);
                this.isComputing = false;
                this.$root.$emit('onShouldResumeProxy');
            }
        }
    }
</script>
