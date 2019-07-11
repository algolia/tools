<template>
    <div class="flex flex-col min-h-0">
        <div class="p-16 flex">
            <input
                v-model="query"
                @input="fetchIndices"
                class="input-custom flex-1 p-8 text-base mr-16"
                placeholder="Filter by index name"
            />
        </div>
        <div class="mx-16 flex mb-16">
            <button
                @click="selectAll"
                class="bg-white rounded border border-b-0 border-proton-grey-opacity-40 shadow-sm hover:shadow transition-fast-out mr-8 px-16 p-8 text-sm mr-12"
            >
                Select all
            </button>
            <button
                @click="unselectAll"
                class="bg-white rounded border border-b-0 border-proton-grey-opacity-40 shadow-sm hover:shadow transition-fast-out mr-8 px-16 p-8 text-sm mr-12">
                Unselect all
            </button>
        </div>
        <div class="mx-16 flex mr-36">
            <div
                class="ml-8 flex-grow cursor-pointer"
                @click="sort = (sort === 'name_desc' ? 'name_asc' : 'name_desc')"
            >
                <chevron-down-icon
                    class="w-8 h-8"
                    fill="currentColor"
                    :class="{'rotate-180': sort === 'name_asc'}"
                />
                Index Name
            </div>
            <div
                class="ml-8 w-128 text-right cursor-pointer"
                @click="sort = (sort === 'updated_desc' ? 'updated_asc' : 'updated_desc')"
            >
                <chevron-down-icon
                    class="w-8 h-8"
                    fill="currentColor"
                    :class="{'rotate-180': sort === 'updated_asc'}"
                />
                Last updated at
            </div>
            <div
                class="ml-8 w-64 text-right cursor-pointer"
                @click="sort = (sort === 'records_desc' ? 'records_asc' : 'records_desc')"
            >
                <chevron-down-icon
                    class="w-8 h-8"
                    fill="currentColor"
                    :class="{'rotate-180': sort === 'records_asc'}"
                />
                Records
            </div>
            <div class="ml-8 w-64 text-right cursor-pointer">
                Synonyms
            </div>
            <div class="ml-8 w-64 text-right cursor-pointer">
                Rules
            </div>
        </div>
        <div class="overflow-y-auto mx-16 min-h-0">
            <div class="p-8" v-if="sortedIndices.length <= 0">No index found</div>
            <div class="min-h-0 pr-16">
                <index
                    v-for="index in sortedIndices"
                    :client="client"
                    :selected="selected"
                    :index-info="index"
                    :key="index.name"
                    @onSelected="onSelected"
                    @onSelectedRange="onSelectedRange"
                    @onAggregation="onAggregation"
                />
            </div>
        </div>
    </div>
</template>

<script>
    import Index from "@/index-manager/Index";
    import ChevronDownIcon from 'common/icons/chevron-down.svg';

    export default {
        name: 'App',
        components: {Index, ChevronDownIcon},
        props: ['client'],
        data: function () {
            return {
                query: '',
                indices: [],
                allIndices: [],
                nbPages: 1,
                maxNbPagesInMemory: 5,
                sort: 'updated_desc',
                selected: {},
            }
        },
        created: function () {
            this.fetchIndices();

            this.$root.$on('finishedAction', () => {
                this.unselectAll();
                this.fetchIndices();
            });
        },
        watch: {
            client: function () { this.fetchIndices(); },
            selected: function () {
                this.$root.$emit('onSelectedUpdated', this.selected);
            }
        },
        computed: {
            sortedIndices: function () {
                return this.sortIndices(this.indices);
            }
        },
        methods: {
            onAggregation: function (oldIndexInfo, indexInfo) {
                Object.keys(indexInfo).forEach((key) => {
                   this.$set(oldIndexInfo, key, indexInfo[key]);
                });
            },
            onSelected: function (indexInfo, value) {
                if (value) {
                    this.$set(this.selected, indexInfo.name, indexInfo);
                } else {
                    this.$delete(this.selected, indexInfo.name);
                }
            },
            onSelectedRange: function (indexInfo) {
                const firstSelectedPos = this.sortedIndices.findIndex((elt) => {
                    return this.selected[elt.name];
                });
                const lastSelectedPos = this.sortedIndices.findIndex((elt) => {
                    return elt.name === indexInfo.name;
                });

                if (firstSelectedPos !== -1) {
                    const firstLast = [firstSelectedPos, lastSelectedPos].sort((a, b) => a - b);
                    for (let i = firstLast[0]; i <= firstLast[1]; i++) {
                        this.onSelected(this.sortedIndices[i], true);
                    }
                } else {
                    this.onSelected(indexInfo, true);
                }

            },
            selectAll: function () {
                this.sortedIndices.forEach((elt) => {
                     this.onSelected(elt, true);
                });
            },
            unselectAll: function () {
                this.selected = {};
            },
            fetchIndices: async function () {
                if (this.query.length === 0) {
                    let data = await this.client.listIndexes(0);
                    this.nbPages = data.nbPages;

                    if (this.nbPages > 1 && this.nbPages <= this.maxNbPagesInMemory) {
                        data = await this.client.listIndexes();
                    }

                    this.allIndices = this.replaceByReplicas(data.items);
                    this.indices = this.allIndices;
                }

                if (this.query.length > 0) {
                    if (this.nbPages > this.maxNbPagesInMemory) {
                        const data = await this.client.listIndexes('0&prefix=' + encodeURIComponent(this.query));
                        this.indices = this.replaceByReplicas(data.items);
                    } else {
                        const words = this.query.split(' ');

                        this.indices = this.allIndices.filter(function (indexInfo) {
                            return words.every(function (word) {
                                return indexInfo.name.indexOf(word) !== -1;
                            });
                        }).sort((a, b) => {
                            if (a.name === this.query) return -1;
                            if (b.name === this.query) return 1;
                            return 0;
                        });
                    }
                }
            },
            replaceByReplicas: function (indices) {
                const replaced = indices.map((index) => {
                    if (index.replicas) {
                        return {
                            ...index,
                            replicas: index.replicas.map((replica) => { return {name: replica}; })
                        }
                    }
                    if (index.primary === undefined) {
                        return index;
                    }
                    return {name: index.primary};
                });

                return replaced.filter((index, pos) => {
                    const findPos = replaced.findIndex((i) => {
                        return i.name === index.name && i.updatedAt !== undefined;
                    });
                    return findPos === pos;
                });
            },
            sortIndices: function (indices) {
                if (this.sort === 'updated_desc') {
                    return indices.sort((a, b) => {
                        return b.updatedAt.localeCompare(a.updatedAt);
                    });
                }
                if (this.sort === 'updated_asc') {
                    return indices.sort((a, b) => {
                        return a.updatedAt.localeCompare(b.updatedAt);
                    });
                }
                if (this.sort === 'name_asc') {
                    return indices.sort((a, b) => {
                        return b.name.localeCompare(a.name);
                    });
                }
                if (this.sort === 'name_desc') {
                    return indices.sort((a, b) => {
                        return a.name.localeCompare(b.name);
                    });
                }
                if (this.sort === 'records_asc') {
                    return indices.sort((a, b) => {
                        return a.entries - b.entries;
                    });
                }
                if (this.sort === 'records_desc') {
                    return indices.sort((a, b) => {
                        return b.entries - a.entries;
                    });
                }
                return indices;
            },
        },
    }
</script>