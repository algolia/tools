<template>
    <internal-app>
        <div class="min-h-screen pb-48">
            <app-header app-name="Attribute / Proximity" />
            <div v-if="currentScenario">
                <div class="flex">
                    <div class="flex flex-col mx-auto bg-white mt-48">
                        <div class="flex items-start rounded">
                            <div class="p-16 pb-0">
                                <h3>Scenarios</h3>
                                <ul class="mt-16">
                                    <li
                                        v-for="scenarioName in Object.keys(scenarios)"
                                        class="flex"
                                        @click="setScenario(scenarioName)"
                                    >
                                        <span class="min-w-24 text-nebula-blue">
                                            <input type="radio" :checked="currentScenario === scenarioName" />
                                        </span>
                                        <span
                                            class="cursor-pointer hover:underline"
                                            :class="{'text-nebula-blue': currentScenario === scenarioName}"
                                        >
                                        {{scenarios[scenarioName].name}}
                                    </span>
                                    </li>
                                </ul>
                            </div>
                            <div class="p-16 pb-0">
                                <h3>Searchable Attributes</h3>
                                <div class="p-16 px-0">
                                    <table>
                                        <tr v-for="attributeName in scenario.searchableAttributes">
                                            <td>{{attributeName}}</td>
                                            <td class="pl-16">
                                                <label>
                                                    <input
                                                        :checked="orderedAttributes[attributeName] === true"
                                                        @input="$set(orderedAttributes, attributeName, $event.target.checked)"
                                                        type="checkbox"
                                                    />
                                                    ordered
                                                </label>
                                            </td>
                                            <td class="pl-16">
                                                <label>
                                                    <input
                                                        :checked="disableProximityAttributes[attributeName] === true"
                                                        @input="$set(disableProximityAttributes, attributeName, $event.target.checked)"
                                                        type="checkbox"
                                                    />
                                                    disable proximity
                                                </label>
                                            </td>
                                        </tr>
                                    </table>
                                </div>
                            </div>
                            <div class="p-16 pb-0">
                                <h3>Recommended Queries</h3>
                                <ul class="mt-16">
                                    <li v-for="q in scenario.queries">
                                        <span class="cursor-pointer hover:underline" @click="query = q">
                                            {{q}}
                                        </span>
                                    </li>
                                </ul>
                            </div>
                            <div class="p-16 pb-0">
                                <h3>Strategies</h3>
                                <ul class="mt-16">
                                    <li
                                        v-for="strategy in strategies"
                                        class="flex"
                                    >
                                        <label>
                                            <input
                                                :checked="disabledStrategies[strategy.name] !== true"
                                                @input="$set(disabledStrategies, strategy.name, !$event.target.checked)"
                                                type="checkbox"
                                            />
                                            {{strategy.name}}
                                        </label>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div class="p-16">
                            <h3>Query</h3>
                            <div class="mt-16 flex items-center px-16 bg-white rounded border border-proton-grey-opacity-80">
                                <search-icon class="block w-16 h-16 mr-16 text-telluric-blue fill-current"/>
                                <input
                                    class="flex-1 block h-full py-8 bg-transparent text-telluric-blue leading-normal"
                                    placeholder="Search logs below"
                                    v-model="query"
                                >
                            </div>
                        </div>
                    </div>
                </div>
                <div class="flex w-full max-w-full justify-between px-48 mt-48">
                    <template v-for="strategy in filteredStrategies">
                        <div class="flex-grow" :style="`max-width: calc(100% / ${filteredStrategies.length})`">
                            <div class="h-32 text-center">
                                <div>{{strategy.name}}</div>
                                <div v-if="strategy.extraInfo">{{strategy.extraInfo}}</div>
                            </div>
                            <records
                                :records="transformedRecords(records, strategy.firstCriteria, strategy.attributeStrategy)"
                                :searchable-attributes="allSearchableAttributes"
                            />
                        </div>
                    </template>
                </div>
            </div>
        </div>
    </internal-app>
</template>

<script>
    import InternalApp from "common/components/app/InternalApp";
    import AppHeader from "common/components/header/AppHeader";
    import SearchIcon from "common/icons/search.svg";
    import Records from "./Records";
    import {isObject, isString} from "common/utils/types";
    import scenarios from "./scenarios";

    export default {
        name: 'App',
        components: {Records, InternalApp, AppHeader, SearchIcon},
        data: function () {
            return {
                query: 'A B C',
                currentScenario: null,
                scenarios: scenarios,
                orderedAttributes: {},
                disableProximityAttributes: {},
                disabledStrategies: {},
                strategies: [
                    {
                        name: 'proximity > attribute (current)',
                        firstCriteria: 'proximity',
                        attributeStrategy: 'attribute-second-current',
                    },
                    {
                        name: 'attribute (current) > proximity',
                        firstCriteria: 'attribute',
                        attributeStrategy: 'attribute-first-current',
                    },
                    {
                        name: 'attribute (current) > proximity (attrCritByMin)',
                        firstCriteria: 'attribute',
                        attributeStrategy: 'attribute-first-current-criteria',
                    },
                    {
                        name: 'proximity > attribute (new)',
                        firstCriteria: 'proximity',
                        attributeStrategy: 'attribute-new',
                    },
                    {
                        name: 'attribute (new) > proximity',
                        firstCriteria: 'attribute',
                        attributeStrategy: 'attribute-new',
                    },
                ]
            }
        },
        watch: {
            currentScenario: function () {
                this.orderedAttributes = {};
                this.disableProximityAttributes = {};
            }
        },
        created: function () {
            this.setScenario('scenario0');
        },
        computed: {
            scenario: function () {
                return this.scenarios[this.currentScenario];
            },
            records: function () {
                if (this.scenario) return this.scenario.records;
                return [];
            },
            filteredStrategies: function () {
                return this.strategies.filter((strategy) => this.disabledStrategies[strategy.name] !== true);
            },
            allSearchableAttributes: function () {
                const attributes = [];
                this.scenario.searchableAttributes.forEach((attribute) => {
                    const attrs = attribute.split(',');
                    attributes.push(...attrs);
                });
                return attributes;
            },
        },
        methods: {
            isOrderedAttribute: function (attributeName) {
                return this.orderedAttributes[attributeName] === true;
            },
            isProximityAttribute: function (attributeName) {
                return !(this.disableProximityAttributes[attributeName] === true);
            },
            setScenario: function (scenario) {
                this.currentScenario = scenario;
                if (this.scenario.queries && this.scenario.queries.length > 0) {
                    this.query = this.scenario.queries[0];
                }
            },
            tokenize: function (record) {
                if (isString(record)) {
                    if (record.length <= 0) return [];
                    return this.normalize(record.trim()).split(' ').map((v) => this.normalize(v));
                }
                if (Array.isArray(record)) {
                    const records = [];
                    record.forEach((r) => {
                        records.push(...this.tokenize(r));
                    });
                    return records;
                }
                if (isObject(record)) {
                    const records = [];
                    Object.keys(record).forEach((key) => {
                        records.push(...this.tokenize(record[key]));
                    });
                    return records;
                }
                return [];
            },
            normalize: function (s) {
                return s.toLowerCase().replace(/[^ a-z0-9]+/gi, '').replace(/ +(?= )/g,'');;
            },
            getHighLightAttribute: function (attributeValue, tokens) {
                if (Array.isArray(attributeValue)) {
                    return attributeValue.map((av) => this.getHighLightAttribute(av, tokens));
                }
                if (isObject(attributeValue)) {
                    const newObj = {};
                    Object.keys(attributeValue).map((key) => {
                        newObj[key] = this.getHighLightAttribute(attributeValue[key], tokens);
                    });
                }
                if (isString(attributeValue)) {
                    const valueTokens = attributeValue.trim().split(' ');
                    return {
                        matchLevel: 'full',
                        value: valueTokens.map((valueToken) => {
                            return tokens.includes(this.normalize(valueToken)) ? `<em>${valueToken}</em>` : valueToken;
                        }).join(' '),
                    }
                }

                return attributeValue;
            },
            getHighLightAttributes: function (record) {
                const tokens = this.query.trim().split(' ').map((v) => this.normalize(v));
                const keys = Object.keys(record);
                const newObj = {};
                keys.forEach((key) => {
                    newObj[key] = this.getHighLightAttribute(record[key], tokens)
                });
                return newObj;
            },
            transformedRecords: function (records, firstCriteria, attributeStrategy) {
                const queryTokens = this.tokenize(this.query);

                if (queryTokens.length <= 0) {
                    return records;
                }

                const recordsMatchingQuery = records.filter((record) => {
                    const recordsTokens = [];
                    Object.keys(record).forEach((attributeName) => {
                        if (this.allSearchableAttributes.includes(attributeName)) {
                            recordsTokens.push(...this.tokenize(record[attributeName]));
                        }
                    });

                    for (let i = 0; i < queryTokens.length; i++) {
                        if (!recordsTokens.includes(queryTokens[i])) {
                            return false;
                        }
                    }
                    return true;
                });

                const newRecords = recordsMatchingQuery.map((record) => {
                    const hr = this.getHighLightAttributes(record);
                     return {
                         ...record,
                         rankingInfo: this.computeProximity(record, attributeStrategy),
                         _highlightResult: hr,
                         _snippetResult: hr,
                     }
                });

                if (firstCriteria === 'attribute') {
                    return newRecords.sort((a, b) => {
                        if (a.rankingInfo.attribute !== b.rankingInfo.attribute) {
                            return a.rankingInfo.attribute - b.rankingInfo.attribute;
                        }
                        if (a.rankingInfo.proximity !== b.rankingInfo.proximity) {
                            return a.rankingInfo.proximity - b.rankingInfo.proximity;
                        }

                        if (this.scenario.customRanking) {
                            for (let i = 0; i < this.scenario.customRanking.length; i++) {
                                const crAttribute = this.scenario.customRanking[i];
                                const aV = a[crAttribute] !== undefined ? a[crAttribute] : -Infinity;
                                const bV = b[crAttribute] !== undefined ? b[crAttribute] : -Infinity;
                                if (aV !== bV) {
                                    return bV - aV;
                                }
                            }
                        }

                        return a.objectID.localeCompare(b.objectID);
                    });
                } else {
                    return newRecords.sort((a, b) => {
                        if (a.rankingInfo.proximity !== b.rankingInfo.proximity) {
                            return a.rankingInfo.proximity - b.rankingInfo.proximity;
                        }
                        return a.rankingInfo.attribute - b.rankingInfo.attribute;
                    });
                }
            },
            computeProximityRec: function (positions, queryTokens, currentProximity, previousPosition, usedPositions, triedPositions, positionsForTokens) {
                if (queryTokens.length === 0) {
                    return {
                        positionsForTokens: positionsForTokens,
                        triedPositions: triedPositions,
                        positions: usedPositions,
                        proximity: currentProximity,
                    }
                }

                const firstToken = queryTokens[0];

                const proximities = [];
                positions[firstToken].forEach((pos) => {
                    let localProximity = 0;

                    const attributeName = this.scenario.searchableAttributes[Math.floor(pos / 1000)];
                    const ordered = this.isOrderedAttribute(attributeName);
                    const hasProximity = this.isProximityAttribute(attributeName);
                    const pos2 = ordered ? pos : Math.floor(pos / 1000) * 1000;

                    if (previousPosition !== undefined) {
                        const previousAttributeName = this.scenario.searchableAttributes[Math.floor(previousPosition / 1000)];
                        const previousHasProximity = this.isProximityAttribute(previousAttributeName);
                        const diff = Math.abs(pos - previousPosition);
                        const diffAttribute = Math.abs(Math.floor(pos / 1000) - Math.floor(previousPosition / 1000));
                        if (diff >= 8 || !hasProximity || !previousHasProximity) {
                            localProximity = 8;
                        } else {
                            localProximity = diff;
                            if (diffAttribute === 0 && pos - previousPosition < 0) {
                                localProximity++;
                            }
                        }
                    }

                    triedPositions.push(pos2);
                    if (positionsForTokens[firstToken] === undefined) positionsForTokens[firstToken] = [];
                    positionsForTokens[firstToken].push(pos2);
                    proximities.push(this.computeProximityRec(positions, queryTokens.slice(1), currentProximity + localProximity, pos, [...usedPositions, pos2], triedPositions, positionsForTokens));
                });

                proximities.sort((a, b) => a.proximity - b.proximity);

                return proximities.length > 0 ? proximities[0] : 0;
            },
            computeProximity: function (record, attributeStrategy) {
                const positions = {};
                this.scenario.searchableAttributes.forEach((attribute, attributePos) => {
                    let pos = 0;
                    attribute.split(',').forEach((samelineAttr) => {
                        if (isString(record[samelineAttr])) {
                            const valueTokens = this.tokenize(record[samelineAttr]);
                            valueTokens.forEach((token, tokenPos) => {
                                positions[token] = positions[token] === undefined ? [] : positions[token];
                                positions[token].push(attributePos * 1000 + Math.min(999, pos + tokenPos));
                            });
                        }
                        if (Array.isArray(record[samelineAttr])) {
                            record[samelineAttr].forEach((arrayValue) => {
                                const valueTokens = arrayValue.trim().split(' ').map((v) => this.normalize(v));
                                valueTokens.forEach((token) => {
                                    positions[token] = positions[token] === undefined ? [] : positions[token];
                                    positions[token].push(attributePos * 1000 + Math.min(999, pos));
                                    pos += 1;
                                });
                                pos += 7;
                            });
                        }
                        pos += 8;
                    });
                });
                Object.keys(positions).forEach((key) => {
                    positions[key].sort((a, b) => a - b);
                });

                const queryTokens = this.query.trim().split(' ').map((v) => this.normalize(v));

                const proximity = this.computeProximityRec(positions, queryTokens, 0, undefined, [], [], {});

                let attribute = 0;
                if (attributeStrategy === 'attribute-second-current' || attributeStrategy === 'attribute-first-current-criteria') {
                    if (proximity.positions.length > 0) {
                        proximity.positions.sort((a, b) => a - b);
                        attribute = proximity.positions[0];
                    }
                } else if (attributeStrategy === 'attribute-first-current') {
                    if (proximity.positions.length > 0) {
                        proximity.triedPositions.sort((a, b) => a - b);
                        attribute = proximity.triedPositions[0];
                    }
                } else if (attributeStrategy === 'attribute-new') {
                    const queryTokensPositions = [];
                    queryTokens.forEach((queryToken) => {
                        const positions = proximity.positionsForTokens[queryToken];
                        if (positions && positions.length > 0) {
                            positions.sort((a, b) => a - b);
                            attribute += Math.floor(positions[0] / 1000) * 1000;
                            queryTokensPositions.push(positions[0]);
                        }
                    });
                    if (queryTokensPositions.length > 0) {
                        queryTokensPositions.sort((a, b) => a - b);
                        attribute += queryTokensPositions[0] % 1000;
                    }
                }

                return {
                    proximity: proximity.proximity,
                    attribute: attribute,
                }
            }
        }
    }
</script>
