<template>
    <div class="flex w-full text-nova-grey bg-moon-grey-opacity-50 border-b border-proton-grey-opacity-20 px-16 py-8">
        <div class="flex">
            <div class="flex">
                <div>Loaded:</div>
                <div class="ml-4">
                    {{differ.indexLoader.indexData.ids[currentTab].length}}
                </div>
                <div>
                    /{{isNaN(differ.indexLoader.indexData.nbHits[currentTab]) ? 'unknown' : differ.indexLoader.indexData.nbHits[currentTab]}}
                </div>
            </div>
            <div class="ml-16 flex">
                <div>Loaded ref:</div>
                <div class="ml-4">
                    {{differ.refIndexLoader.indexData.ids[currentTab].length}}
                </div>
                <div>
                    /{{isNaN(differ.refIndexLoader.indexData.nbHits[currentTab]) ? 'unknown' : differ.refIndexLoader.indexData.nbHits[currentTab]}}
                </div>
            </div>
            <div
                class="ml-16 cursor-pointer text-nebula-blue hover:underline"
                v-if="currentTab === 'records' && !(differ.isComplete || loading)"
                @click="loadAll"
            >
                Load all
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'LoadedInfo',
        props: ['currentTab', 'differ'],
        data: function () {
            return {
                loading: false,
            };
        },
        methods: {
            loadMore: function () {
                this.loading = true;
                this.$root.$emit('resetPage');
                if (this.currentTab === 'records') {
                    this.differ.records().then(() => {
                        this.loading = false;
                    });
                }
            },
            loadAll: function () {
                this.loading = true;
                this.$root.$emit('resetPage');
                this.differ.loadAllRecords().then(() => {
                    this.loading = false;
                });
            }
        }
    }
</script>
