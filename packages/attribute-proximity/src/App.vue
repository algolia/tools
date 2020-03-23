<template>
    <internal-app>
        <div class="min-h-screen pb-48">
            <app-header app-name="Attribute / Proximity" />
            <div>
                <div class="max-w-960 mx-auto mt-24">
                    <div class="flex items-center px-16 bg-white rounded border border-proton-grey-opacity-80">
                        <search-icon class="block w-16 h-16 mr-16 text-telluric-blue fill-current"/>
                        <input
                            class="flex-1 block h-full py-8 bg-transparent text-telluric-blue leading-normal"
                            placeholder="Search logs below"
                            v-model="query"
                        >
                    </div>
                </div>
                <div class="flex justify-between mx-48 mt-48">
                    <div class="w-20p">
                        <div class="h-32 text-center">proximity > attribute (current)</div>
                        <records :records="transformedRecords(records, 'proximity', 'attribute-second-current')" />
                    </div>
                    <div class="w-20p">
                        <div class="h-32 text-center">attribute (current) > proximity</div>
                        <records :records="transformedRecords(records, 'attribute', 'attribute-first-current')" />
                    </div>
                    <div class="w-20p">
                        <div class="h-32 text-center">
                            <div>attribute (current) > proximity</div>
                            <div>attributeCriteteriaComputedByMinProximity</div>
                        </div>
                        <records :records="transformedRecords(records, 'attribute', 'attribute-first-current-criteria')" />
                    </div>
                    <div class="w-20p">
                        <div class="h-32 text-center">proximity > attribute (new)</div>
                        <records :records="transformedRecords(records, 'proximity', 'attribute-new')" />
                    </div>
                    <div class="w-20p">
                        <div class="h-32 text-center">attribute (new) > proximity</div>
                        <records :records="transformedRecords(records, 'attribute', 'attribute-new')" />
                    </div>
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

    export default {
        name: 'App',
        components: {Records, InternalApp, AppHeader, SearchIcon},
        data: function () {
            return {
                query: 'A B C',
                records: [
                    {
                        objectID: '1',
                        title: 'A B C D',
                        subTitle: 'D E',
                        description: 'F',
                        categories: [],
                    },
                    {
                        objectID: '2',
                        title: 'D A B C',
                        subTitle: 'D E',
                        description: 'F',
                        categories: [],
                    },
                    {
                        objectID: '3',
                        title: 'A',
                        subTitle: 'B C',
                        description: 'D F',
                        categories: [],
                    },
                    {
                        objectID: '4',
                        title: 'A',
                        subTitle: 'C B',
                        description: 'D F',
                        categories: [],
                    },
                    {
                        objectID: '5',
                        title: 'E F',
                        subTitle: 'A B C',
                        description: 'D F',
                        categories: [],
                    },
                    {
                        objectID: '6',
                        title: 'A',
                        subTitle: 'A B C',
                        description: 'D E F',
                        categories: [],
                    },
                    {
                        objectID: '7',
                        title: 'A B C',
                        subTitle: 'A B D',
                        description: 'D E F',
                        categories: [],
                    },
                    {
                        objectID: '8',
                        title: 'A',
                        subTitle: 'Z',
                        description: 'Z',
                        categories: ['A', 'B', 'C'],
                    },
                    {
                        objectID: '9',
                        title: 'Z',
                        subTitle: 'A',
                        description: 'Z',
                        categories: ['A B C', 'C'],
                    },
                    {
                        objectID: '10',
                        title: 'Z',
                        subTitle: 'Z',
                        description: 'Z',
                        categories: ['A', 'B C'],
                    },
                    {
                        objectID: '11',
                        title: ['a', 'b'],
                        subTitle: ['c', 'd'],
                    },
                    {
                        objectID: '12',
                        title: ['a', 'b', 'c', 'd'],
                        subTitle: [],
                    },
                    {
                        objectID: '13',
                        title: 'A B',
                        subTitle: 'D',
                        description: 'C',
                    },
                    {
                        objectID: '14',
                        title: 'A B',
                        subTitle: 'C',
                        description: 'D',
                    },
                    {
                        objectID: '15',
                        title: 'shirt',
                        subTitle: 'blue',
                        description: 'This shirt also exist in red',
                    },
                    {
                        objectID: '16',
                        title: 'shirt',
                        subTitle: 'blue',
                        description: 'Goes well with red dress',
                    },
                    {
                        objectID: '16',
                        title: 'shirt',
                        subTitle: 'red',
                        description: 'Goes well with yellow dress',
                    },
                ]
            }
        },
        methods: {
            tokenize: function (record) {
                if (isString(record)) {
                    return record.trim().split(' ').map((v) => this.normalize(v));
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
                return s.toLowerCase();
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
                const newRecords = records.filter((record) => {
                    const recordsTokens = this.tokenize(record);
                    for (let i = 0; i < queryTokens.length; i++) {
                        if (!recordsTokens.includes(queryTokens[i])) {
                            return false;
                        }
                    }
                    return true;
                }).map((record) => {
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
                        return a.rankingInfo.proximity - b.rankingInfo.proximity;
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

                    if (previousPosition !== undefined) {
                        const diff = Math.abs(pos - previousPosition);
                        const diffAttribute = Math.abs(Math.floor(pos / 1000) - Math.floor(previousPosition / 1000));
                        if (diff >= 8) {
                            localProximity = 8;
                        } else {
                            localProximity = diff;
                            if (diffAttribute === 0) {
                                localProximity++;
                            }
                        }
                    }

                    triedPositions.push(pos);
                    if (positionsForTokens[firstToken] === undefined) positionsForTokens[firstToken] = [];
                    positionsForTokens[firstToken].push(pos);
                    proximities.push(this.computeProximityRec(positions, queryTokens.slice(1), currentProximity + localProximity, pos, [...usedPositions, pos], triedPositions, positionsForTokens));
                });

                proximities.sort((a, b) => a.proximity - b.proximity);

                return proximities.length > 0 ? proximities[0] : 0;
            },
            computeProximity: function (record, attributeStrategy) {
                const positions = {};
                ['title', 'subTitle', 'description', 'categories'].forEach((attribute, attributePos) => {
                    if (isString(record[attribute])) {
                        const valueTokens = record[attribute].trim().split(' ').map((v) => this.normalize(v));
                        valueTokens.forEach((token, tokenPos) => {
                            positions[token] = positions[token] === undefined ? [] : positions[token];
                            positions[token].push(attributePos * 1000 + tokenPos);
                        });
                    }
                    if (Array.isArray(record[attribute])) {
                        let pos = 0;
                        record[attribute].forEach((arrayValue) => {
                            const valueTokens = arrayValue.trim().split(' ').map((v) => this.normalize(v));
                            valueTokens.forEach((token) => {
                                positions[token] = positions[token] === undefined ? [] : positions[token];
                                positions[token].push(attributePos * 1000 + pos);
                                pos += 1;
                            });
                            pos += 7;
                        });
                    }
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
