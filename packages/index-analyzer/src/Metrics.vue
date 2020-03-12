<template>
    <div>
        <div v-if="isComputing" class="p-16">
            {{isComputing ? 'computing': ''}}
            {{i}}/{{nbHits}} <span v-if="nbHits > 0">{{Math.floor(i*100/nbHits)}}%</span>
        </div>
        <div
            v-if="!isComputing && hasBeenSampled"
            class="flex items-center text-solstice-blue bg-saturn-4-opacity-80 p-16"
        >
            <div>
                The metrics have been computed on a subset of {{i}} records out of {{nbHits}} ({{Math.floor(i*100/nbHits)}}%).
            </div>
            <div
                @click="enableSample = false; compute()"
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
            <div v-if="name.length > 0">
                <h2 class="mb-24">Types</h2>
                <table>
                    <tr
                        v-for="type in data.sortedTypes"
                        class="border-t border-proton-grey-opacity-30"
                    >
                        <td class="p-8">
                            <span
                                v-if="typeFilter === null"
                                class="cursor-pointer text-nebula-blue hover:underline"
                                @click="$emit('onUpdateAttributeName', `${name}:${type}`)"
                            >
                                {{type}}
                            </span>
                            <span v-else>{{type}}</span>
                        </td>
                        <td class="p-8">{{data.type[type]}}</td>
                        <td class="p-8">{{percent(data.type[type], data.nbHits)}}</td>
                    </tr>
                </table>
            </div>
            <div v-if="data.type.object">
                <h2 v-if="name.length > 0" class="my-24">Object keys</h2>
                <tr
                    v-for="key in data.object.sortedKeys"
                    class="border-t border-proton-grey-opacity-30"
                >
                    <td class="p-8">
                        <span
                            class="cursor-pointer text-nebula-blue hover:underline"
                            @click="$emit('onUpdateAttributeName', `${name}${name.length > 0 ? '.': ''}${key}`)"
                        >
                            {{key}}
                        </span>
                    </td>
                    <td class="p-8">{{data.object.keysUniqueWithCount[key]}}</td>
                    <td class="p-8">{{percent(data.object.keysUniqueWithCount[key], data.type.object)}}</td>
                </tr>
            </div>
            <div v-if="data.type.boolean">
                <h2 class="my-24">Boolean values</h2>
                <table>
                    <tr class="border-t border-proton-grey-opacity-30">
                        <td class="p-8">True</td>
                        <td class="p-8">{{data.boolean.true}}</td>
                        <td class="p-8">{{percent(data.boolean.true, data.type.boolean)}}</td>
                    </tr>
                    <tr class="border-t border-proton-grey-opacity-30">
                        <td class="p-8">False</td>
                        <td class="p-8">{{data.boolean.false}}</td>
                        <td class="p-8">{{percent(data.boolean.false, data.type.boolean)}}</td>
                    </tr>
                </table>
            </div>
            <div v-if="data.type.numeric">
                <h2 class="my-24">Numeric values</h2>
                <table>
                    <tr
                        v-for="metric in ['min', 'max', 'mean', 'p1', 'p25', 'median', 'p75', 'p99']"
                        class="border-t border-proton-grey-opacity-30"
                    >
                        <td class="p-8">{{metric}}</td>
                        <td class="p-8">{{data.numerics[metric]}}</td>
                    </tr>
                </table>
                <distribution-chart :data="data" :attribute-name="name" />
            </div>
            <div v-if="Object.keys(data.values.stringUniqueValuesWithCount).length > 0">
                <h2 class="my-24">String Values</h2>
                <div class="flex">
                    <values-list :data="data"/>
                    <div>
                        <table>
                            <tr class="border-t border-proton-grey-opacity-30">
                                <td class="p-8">Average count</td>
                                <td class="p-8">{{data.values.averageStringCountValues}}</td>
                            </tr>
                            <tr class="border-t border-proton-grey-opacity-30">
                                <td class="p-8">Average length</td>
                                <td class="p-8">{{data.values.averageLength}}</td>
                            </tr>
                            <tr class="border-t border-proton-grey-opacity-30">
                                <td class="p-8">Average nbWords</td>
                                <td class="p-8">{{data.values.averageNbWords}}</td>
                            </tr>
                        </table>
                    </div>
                </div>
            </div>
            <div v-if="data.recordsMatching.length > 0">
                <h2 class="py-24">First 10 hits</h2>
                <hits
                    :hits="data.recordsMatching"
                    :attribute-parts="attributeParts"
                />
            </div>
        </div>
    </div>
</template>

<script>
    import {getSearchIndex} from "common/utils/algoliaHelpers";
    import {getRaw} from "common/utils/objectHelpers";
    import {isNumber, isObject, isString} from "common/utils/types";
    import DistributionChart from "./DistributionChart";
    import ValuesList from "./ValuesList";
    import Hits from "./Hits";

    export default {
        name: 'Metrics',
        components: {Hits, ValuesList, DistributionChart},
        props: ['appId', 'indexName', 'attributeName'],
        data: function () {
            return {
                isComputing: false,
                enableSample: true,
                hasBeenSampled: false,
                sampleLimit: 1000,
                i: 0,
                nbHits: 0,
                data: null,
            }
        },
        created: function () {
            this.compute();
        },
        watch: {
            appId: function () { this.enableSample = true; this.compute() },
            indexName: function () { this.enableSample = true; this.compute() },
            attributeName: function () { this.enableSample = true; this.compute() },
        },
        computed: {
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
            percent: function(nb, count) {
                if (count === 0) return '0%';
                return `${(nb * 100 / count).toFixed(2)}%`;
            },
            compute: async function () {
                this.$root.$emit('onShouldPauseProxy');
                this.isComputing = true;
                this.data = null;
                this.hasBeenSampled = false;

                const index = await getSearchIndex(this.appId, this.apiKey, this.indexName);

                const data = {
                    readNbHits: 0,
                    nbHits: 0,
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
                        data.nbHits++;
                        data.type.undefined++;
                    } else if (shouldProcessNumber && isNumber(value)) {
                        if (data.recordsMatching.length < 10) data.recordsMatching.push(hit);
                        data.nbHits++;
                        data.type.numeric++;
                        data.values.numericValues.push(value);
                        data.numerics.sum += value;
                        data.values.numericUniqueValueWithCount[value] = data.values.numericUniqueValueWithCount[value] || 0;
                        data.values.numericUniqueValueWithCount[value]++;
                    } else if (shouldProcessArray && Array.isArray(value)) {
                        if (data.recordsMatching.length < 10) data.recordsMatching.push(hit);
                        data.nbHits++;
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
                        data.nbHits++;
                        data.type.object++;

                        Object.keys(value).forEach((v) => {
                            data.object.keysUniqueWithCount[v] = data.object.keysUniqueWithCount[v] || 0;
                            data.object.keysUniqueWithCount[v]++;
                        });
                    } else if (shouldProcessBoolean && value === true) {
                        if (data.recordsMatching.length < 10) data.recordsMatching.push(hit);
                        data.nbHits++;
                        data.type.boolean++;
                        data.boolean.true++;
                    } else if (shouldProcessBoolean && value === false) {
                        if (data.recordsMatching.length < 10) data.recordsMatching.push(hit);
                        data.nbHits++;
                        data.type.boolean++;
                        data.boolean.false++;
                    } else if (shouldProcessNull && value === null) {
                        if (data.recordsMatching.length < 10) data.recordsMatching.push(hit);
                        data.nbHits++;
                        data.type.null++;
                    } else if (shouldProcessString && isString(value)) {
                        if (data.recordsMatching.length < 10) data.recordsMatching.push(hit);
                        data.nbHits++;
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

                if (!this.enableSample || data.readNbHits < this.sampleLimit) {
                    while (res.cursor) {
                        res = await index.customBrowse({cursor: res.cursor});
                        res.hits.forEach((hit) => processHit(hit));
                        this.i = data.readNbHits;

                        if (this.enableSample && data.readNbHits >= this.sampleLimit) {
                            break;
                        }
                    }
                }

                this.hasBeenSampled = (res.cursor !== undefined);

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

                this.data = data;
                this.isComputing = false;
                this.$root.$emit('onShouldResumeProxy');
            }
        }
    }
</script>
