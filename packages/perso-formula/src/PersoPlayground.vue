<template>
    <div>
        <div class="flex mt-12">
            <div class="ml-12">
                <div>Dataset</div>
                <div>
                    <select v-model="dataset">
                        <option value="movies.json">movies.json</option>
                    </select>
                </div>
            </div>
            <div class="ml-12">
                <div>Profile</div>
                <div>
                    <textarea v-model="optionalFilters" class="w-300 h-100"></textarea>
                </div>
            </div>
            <div class="ml-12">
                <div>Searchable Attributes</div>
                <div>
                    <textarea v-model="searchableAttributesText" class="w-300 h-100"></textarea>
                </div>
            </div>
            <div class="ml-12">
                <div>Custom Ranking</div>
                <div>
                    <textarea v-model="customRankingText" class="w-300 h-100"></textarea>
                </div>
            </div>
            <div class="ml-12">
                <div>Perso Impact</div>
                <div>
                    <input type="number" v-model.number="personalizationImpact"/>
                </div>
            </div>
        </div>
        <div>{{records.length}}</div>
        <div>{{loading}}</div>
        <div class="flex">
            <div class="min-w-0 flex-1">
                <hits :hits="nonPersoRecordsToDisplay.slice(0, 8)" />
            </div>
            <compare-hits
                class="min-w-240 max-w-240 flex-1"
                :left-hits="nonPersoRecordsToDisplay.slice(0, 100)"
                :right-hits="persoRecordsToDisplay.slice(0, 100)"
                :analyse-max-nb-points="100"
                :split-mode="true"
            />
            <div class="min-w-0 flex-1">
                <hits :hits="persoRecordsToDisplay.slice(0, 8)" />
            </div>
        </div>
    </div>
</template>

<script>
    import Hits from "@/Hits";
    import CompareHits from "common/components/compare/CompareHits";

    import strategy1 from '@/strategies/strategy1';

    import SearchEngine from 'common/local-search-engine';

    export default {
        name: 'PersoPlayground',
        components: {Hits, CompareHits},
        data: function () {
            return {
                dataset: 'movies.json',
                records: [],
                loading: false,
                searchableAttributesText: "title\nalternative_titles\nactors\ngenre",
                customRankingText: "desc(score)",
                optionalFilters: "genre:drama<score=2>\nactors:Morgan Freeman<score=1>",
                personalizationImpact: 50,
                currentStrategy: strategy1,
                stategies: [
                    strategy1
                ]
            }
        },
        created: async function () {
            await this.loadDataset();
            console.log('loaded dataset');
            const engine = new SearchEngine(this.nonPersoRecordsToDisplay, ['title']);
            console.log('indexed objects');
            console.log(engine.search('red'));
        },
        computed: {
            sorts: function () {
                return this.customRankingText.split('\n').map((cr) => {
                    const matches = cr.match(/asc\((.*?)\)/);
                    if (matches && matches.length === 2) {
                        const attributeName = matches[1];
                        return (a, b) => {
                            return a[attributeName] - b[attributeName];
                        };
                    }
                    const matches2 = cr.match(/desc\((.*?)\)/);
                    if (matches2 && matches2.length === 2) {
                        const attributeName = matches2[1];
                        return (a, b) => {
                            return b[attributeName] - a[attributeName];
                        };
                    }
                    return null;
                }).filter((s) => s);
            },
            persoProfile: function () {
                return this.optionalFilters.split('\n').map(function (filter) {
                    const matches = filter.match(/(.*?):(.*?)<score=(.*?)>/);
                    if (matches && matches.length === 4) {
                        return {facetName: matches[1], facetValue: matches[2].toLowerCase(), score: parseInt(matches[3])};
                    }
                    return null;
                }).filter((f) => f)
            },
            transformedRecords: function () {
                const records = this.currentStrategy.transformRecordsForPerso(this.records, this.persoProfile, this.personalizationImpact);

                this.sorts.forEach((sortFunc) => {
                    records.sort(sortFunc);
                });

                return records;
            },
            nonPersoRecordsToDisplay: function () {
                return this.transformedRecords;
            },
            persoRecordsToDisplay: function () {
                return this.currentStrategy.sortsRecordsForPerso(this.transformedRecords);
            }
        },
        methods: {
            loadDataset: async function () {
                this.loading = true;
                const res = await fetch(`/perso-formula/datasets/${this.dataset}`);
                const dataset = await res.json();
                this.records = Object.freeze(dataset);
                this.loading = false;
            }
        }
    }
</script>