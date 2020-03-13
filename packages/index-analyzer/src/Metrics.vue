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
            <div
                v-if="!isComputing && data && data.isSampled"
                class="flex items-center text-solstice-blue bg-saturn-4-opacity-80 p-16"
            >
                <div>
                    The metrics have been computed on a subset of {{i}} records out of {{nbHits}} ({{Math.floor(i*100/nbHits)}}%).
                </div>
                <div
                    @click="compute(false)"
                    class="ml-24 cursor-pointer bg-white rounded border border-proton-grey-opacity-40 shadow-sm hover:shadow transition-fast-out px-16 p-8 text-sm relative group"
                >
                    Load all
                </div>
            </div>
            <div class="flex p-16">
                <div v-if="name.length === 0">All attributes</div>
                <div v-else
                     class="cursor-pointer text-nebula-blue hover:underline"
                     @click="$emit('onUpdateAttributeName', '')"
                >
                    All attributes
                </div>
                <template v-if="name.length > 0" v-for="(part, i) in attributeParts">
                    <div>
                        <span>&nbsp;>&nbsp;</span>
                        <span
                            v-if="i < attributeParts.length - 1 || typeFilter !== null"
                            class="cursor-pointer text-nebula-blue hover:underline"
                            @click="$emit('onUpdateAttributeName', attributeParts.slice(0, i + 1).join('.'))"
                        >{{part}}</span>
                        <span v-else>{{part}}</span>
                    </div>
                </template>
                <div v-if="typeFilter">&nbsp;: {{typeFilter}}</div>
            </div>
            <div v-if="data" class="p-16">
                <types :data="data" :type-filter="typeFilter" :name="name" v-on="$listeners" />
                <object-keys :data="data" :name="name" v-on="$listeners" />
                <boolean-values :data="data" v-on="$listeners" />
                <numeric-values :data="data" :name="name" v-on="$listeners" />
                <string-values :data="data" v-on="$listeners" />
                <hits :data="data" :attribute-parts="attributeParts" v-on="$listeners" />
            </div>
        </div>
        </div>
</template>

<script>
    import {getSearchIndex} from "common/utils/algoliaHelpers";
    import {getRaw} from "common/utils/objectHelpers";
    import {isNumber, isObject, isString} from "common/utils/types";
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
        props: ['appId', 'indexName', 'attributeName'],
        data: function () {
            return {
                isComputing: false,
                sampleLimit: 1000,
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
        },
        computed: {
            data: {
                get () {
                    return this.cached[this.attributeName];
                },
                set (data) {
                    this.$set(this.cached, this.attributeName, data);
                }
            },
            apiKey: function () {
                return this.$store.state.apps[this.appId] ? this.$store.state.apps[this.appId].key : '';
            },
            attributeParts: function () {
                return this.name.split('.');
            },
            name: function () {
                return this.attributeName.split(':')[0];
            },
            typeFilter: function () {
                const parts = this.attributeName.split(':');
                return parts.length > 1 && parts[1].length > 0 ? parts[1] : null;
            }
        },
        methods: {
            compute: async function (enableSample) {
                if (this.data && (enableSample || !this.data.isSampled)) return;

                this.$root.$emit('onShouldPauseProxy');
                this.isComputing = true;

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
                    },
                    recordsMatching: [],
                };

                const shouldProcessUndefined = this.typeFilter === null || this.typeFilter === 'undefined';
                const shouldProcessNumber = this.typeFilter === null || this.typeFilter === 'number';
                const shouldProcessArray = this.typeFilter === null || this.typeFilter === 'array';
                const shouldProcessObject = this.typeFilter === null || this.typeFilter === 'object';
                const shouldProcessBoolean = this.typeFilter === null || this.typeFilter === 'boolean';
                const shouldProcessNull = this.typeFilter === null || this.typeFilter === 'null';
                const shouldProcessString = this.typeFilter === null || this.typeFilter === 'string';

                const processHit = (hit) => {
                    const value = getRaw(hit, this.name);

                    data.readNbHits++;

                    // types
                    if (shouldProcessUndefined && value === undefined) {
                        if (data.recordsMatching.length < 10) data.recordsMatching.push(hit);
                        data.matchingNbHits++;
                        data.type.undefined++;
                    } else if (shouldProcessNumber && isNumber(value)) {
                        if (data.recordsMatching.length < 10) data.recordsMatching.push(hit);
                        data.matchingNbHits++;
                        data.type.numeric++;
                        data.values.numericValues.push(value);
                        data.numerics.sum += value;
                        data.values.numericUniqueValueWithCount[value] = data.values.numericUniqueValueWithCount[value] || 0;
                        data.values.numericUniqueValueWithCount[value]++;
                    } else if (shouldProcessArray && Array.isArray(value)) {
                        if (data.recordsMatching.length < 10) data.recordsMatching.push(hit);
                        data.matchingNbHits++;
                        data.type.array++;

                        value.forEach((v) => {
                            if (isString(v) || isNumber(v)) {
                                data.values.stringUniqueValuesWithCount[v] = data.values.stringUniqueValuesWithCount[v] || 0;
                                data.values.stringUniqueValuesWithCount[v]++;
                                data.values.sumLength += v.toString().length;
                                data.values.sumNbWords += v.toString().split(' ').length;
                            }
                        });
                    } else if (shouldProcessObject && isObject(value)) {
                        if (data.recordsMatching.length < 10) data.recordsMatching.push(hit);
                        data.matchingNbHits++;
                        data.type.object++;

                        Object.keys(value).forEach((v) => {
                            data.object.keysUniqueWithCount[v] = data.object.keysUniqueWithCount[v] || 0;
                            data.object.keysUniqueWithCount[v]++;
                        });
                    } else if (shouldProcessBoolean && value === true) {
                        if (data.recordsMatching.length < 10) data.recordsMatching.push(hit);
                        data.matchingNbHits++;
                        data.type.boolean++;
                        data.boolean.true++;
                    } else if (shouldProcessBoolean && value === false) {
                        if (data.recordsMatching.length < 10) data.recordsMatching.push(hit);
                        data.matchingNbHits++;
                        data.type.boolean++;
                        data.boolean.false++;
                    } else if (shouldProcessNull && value === null) {
                        if (data.recordsMatching.length < 10) data.recordsMatching.push(hit);
                        data.matchingNbHits++;
                        data.type.null++;
                    } else if (shouldProcessString && isString(value)) {
                        if (data.recordsMatching.length < 10) data.recordsMatching.push(hit);
                        data.matchingNbHits++;
                        data.type.string++;
                        data.values.stringUniqueValuesWithCount[value] = data.values.stringUniqueValuesWithCount[value] || 0;
                        data.values.stringUniqueValuesWithCount[value]++;
                        data.values.sumLength += value.length;
                        data.values.sumNbWords += value.toString().split(' ').length;
                    } else {
                        if (this.typeFilter === null) {
                            console.log('Unknown type', value);
                        }
                    }
                };

                let res = await index.customBrowse({query: '', attributesToRetrieve: ['*']});
                this.nbHits = res.nbHits;
                res.hits.forEach((hit) => processHit(hit));
                this.i = data.readNbHits;

                if (!enableSample || data.readNbHits < this.sampleLimit) {
                    while (res.cursor) {
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
                    data.values.averageLength = (data.values.sumLength / Object.keys(data.values.stringUniqueValuesWithCount).length).toFixed(2);
                    data.values.averageNbWords = (data.values.sumNbWords / Object.keys(data.values.stringUniqueValuesWithCount).length).toFixed(2);

                    // types
                    data.sortedTypes = Object.keys(data.type).filter((t) => this.typeFilter === null || this.typeFilter === t);
                    data.sortedTypes.sort((a, b) => data.type[b] - data.type[a]);

                    data.object.sortedKeys = Object.keys(data.object.keysUniqueWithCount);
                    data.object.sortedKeys.sort((a, b) => data.object.keysUniqueWithCount[b] - data.object.keysUniqueWithCount[a]);
                }

                this.data = Object.freeze(data);
                this.isComputing = false;
                this.$root.$emit('onShouldResumeProxy');
            }
        }
    }
</script>
