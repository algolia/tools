<template>
    <div class="pb-16">
        <div class="px-8 py-16 flex justify-center">
            <small-tabs
                v-model="currentTab"
                :tabs="[
                    {value: 'settings', name: 'Settings'},
                    {value: 'synonyms', name: 'Synonyms'},
                    {value: 'rules', name: 'Rules'},
                    {value: 'records', name: 'Records'},
                ]"
            />
        </div>
        <div v-if="currentTab === 'records'">
            <objects-diff v-if="differ && differ.diffs.records" :differ="differ" :resource-name="currentTab" />
        </div>
        <div v-if="currentTab === 'synonyms'">
            <objects-diff v-if="differ && differ.diffs.synonyms" :differ="differ" :resource-name="currentTab" />
        </div>
        <div v-if="currentTab === 'rules'">
            <objects-diff v-if="differ && differ.diffs.rules" :differ="differ" :resource-name="currentTab" />
        </div>
        <div v-if="currentTab === 'settings'">
            <compare-strings
                v-if="differ && Object.keys(differ.A.settings).length > 0 && Object.keys(differ.B.settings).length > 0"
                :string-a="JSON.stringify(differ.A.settings, null, 2)"
                :string-b="JSON.stringify(differ.B.settings, null, 2)"
            />
        </div>
    </div>
</template>

<script>
    import {getSearchClient} from 'common/utils/algoliaHelpers';
    import Differ from "@/index-differ/differ";
    import CompareStrings from "@/index-differ/CompareStrings";
    import SmallTabs from "common/components/tabs/SmallTabs";
    import ObjectsDiff from "@/index-differ/ObjectsDiff";

    export default {
        name: 'Diffs',
        components: {ObjectsDiff, CompareStrings, SmallTabs},
        props: ['leftAppId', 'leftIndexName', 'rightAppId', 'rightIndexName'],
        data: function () {
            return {
                leftIndex: null,
                rightIndex: null,
                differ: null,
            }
        },
        created: async function () {
            await this.getLeftIndex();
            await this.getRightIndex();
            this.getDiffer();
        },
        watch: {
            leftAppId: async function () {
                await this.getLeftIndex();
                this.getDiffer();
            },
            leftIndexName: async function  () {
                await this.getLeftIndex();
                this.getDiffer();
            },
            rightAppId: async function () {
                await this.getRightIndex();
                this.getDiffer();
            },
            rightIndexName: async function () {
                await this.getRightIndex();
                this.getDiffer();
            },
        },
        computed: {
            currentTab: {
                get () {
                    return this.$store.state.indexdiffer.currentTab || 'settings';
                },
                set (tabName) {
                    this.$store.commit(`indexdiffer/setCurrentTab`, tabName);
                }
            },
        },
        methods: {
            getLeftIndex: async function () {
                if (!this.leftAppId || !this.leftIndexName) return;
                const client = await getSearchClient(this.leftAppId, this.adminAPIKey(this.leftAppId));
                this.leftIndex = client.initIndex(this.leftIndexName);
            },
            getRightIndex: async function () {
                if (!this.rightAppId || !this.rightIndexName) return;
                const client = await getSearchClient(this.rightAppId, this.adminAPIKey(this.rightAppId));
                this.rightIndex = client.initIndex(this.rightIndexName);
            },
            getDiffer: function () {
                if (!this.leftIndex || !this.rightIndex) return;
                this.differ = new Differ(this.leftIndex, this.rightIndex);
            },
            adminAPIKey: function (appId) {
                return this.$store.state.apps[appId].key;
            },
        },
    }
</script>