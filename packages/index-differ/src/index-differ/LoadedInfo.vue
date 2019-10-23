<template>
    <div v-if="currentTab !== 'settings' && differ">
        <div class="flex">
            <div><span class="capitalize">{{currentTab}}</span> loaded:</div>
            <div class="ml-4">
                {{Math.max(differ.A.ids[currentTab].length, differ.B.ids[currentTab].length)}}
            </div>
            <div>
                /{{isNaN(differ.A.nbHits[currentTab]) ? 'unknown' : Math.max(differ.A.nbHits[currentTab], differ.B.nbHits[currentTab])}}
            </div>
            <div
                class="ml-16 cursor-pointer text-nebula-blue hover:underline"
                v-if="currentTab === 'records' && !(differ.isComplete || loading)"
                @click="loadAll"
            >
                Load all
            </div>
        </div>
        <div>
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
                if (this.currentTab === 'records') {
                    this.differ.allRecords().then(() => {
                        this.loading = false;
                    });
                }
            }
        }
    }
</script>
