<template>
    <div v-if="indexData">
        <params-header
            :panel-key="panelKey"
            :config-key="configKey"
            :keys="sortedKeys"
            :open="open"
            @onSetOpen="open = $event"
        />
        <div class="bg-white" :class="open ? 'p-8 py-12' : ''">
            <params
                :id="`${panelKey}-${configKey}`"
                :panel-key="panelKey"
                :config-key="configKey"
                :params="params"
                :ref-params="refParams"
                :raw-params="rawParams"
                :keys="sortedKeys"
                :keys-indexer="indexKeysIndexer"
                @onSetParamValue="onSetParamValue"
                @onSetParamEnabled="onSetParamEnabled"
                @onAddArrayElement="onAddArrayElement"
                @onDeleteArrayElement="onDeleteArrayElement"
                @onDeleteKey="onDeleteKey"
                @onRestoreKey="onRestoreKey"
                v-if="open"
            />
            <div v-if="configKey === 'indexSettings'">
                <div class="mt-24 border-t border-proton-grey-opacity-20"></div>
                <save-or-copy-settings :panel-key="panelKey" :read-only="readOnly" />
            </div>
        </div>
    </div>
</template>

<script>
    import indexInfoMixin from "common/mixins/indexInfoMixin";
    import ParamsHeader from "@/dashboard/ParamsHeader.vue";
    import Params from "common/components/params/Params.vue";
    import SaveOrCopySettings from "@/dashboard/SaveOrCopySettings.vue";
    import panelsMixin from "common/mixins/panelsMixin";

    export default {
        name: 'ParamsPanel',
        components: {SaveOrCopySettings, Params, ParamsHeader},
        props: ['panelKey', 'configKey', 'readOnly'],
        mixins: [indexInfoMixin, panelsMixin],
        data: function () {
            return {
                open: true,
            }
        },
        computed: {
            appId: function () { // Needed for indexInfoMixin
                return this.panelAppId;
            },
            indexName: function () { // Needed for indexInfoMixin
                return this.panelIndexName;
            },
            sortedKeys: function () {
                return Object.keys(this.params).sort(function (a, b) {
                    if (a === 'searchableAttributes') return -1;
                    if (b === 'searchableAttributes') return 1;
                    if (a === 'attributesToIndex') return -1;
                    if (b === 'attributesToIndex') return 1;
                    if (a === 'customRanking') return -1;
                    if (b === 'customRanking') return 1;
                    if (a === 'attributesForFaceting') return -1;
                    if (b === 'attributesForFaceting') return 1;
                    if (a < b) return -1;
                    if (a > b) return 1;
                    return 0;
                });
            },
            params: function () {
                if (this.configKey !== 'indexSettings') return this.indexData[this.configKey] || {};
                return Object.assign({}, this.refIndexSettingsRaw, this.indexSettingsRaw);
            },
            rawParams: function () {
                if (this.configKey === 'indexSettings') {
                    return this.indexSettingsRaw;
                }
                return this.searchParamsRaw;
            },
            refParams: function () {
                if (this.configKey === 'indexSettings') {
                    return this.refIndexSettingsRaw;
                }
                return this.searchParamsRaw;
            }
        },
        methods: {
            onSetParamValue: function (key, value) {
                this.$store.commit(`${this.indexCommitPrefix}/setParamValue`, {configKey: this.configKey, key, value});
            },
            onSetParamEnabled: function (key, value) {
                this.$store.commit(`${this.indexCommitPrefix}/setParamEnabled`, {configKey: this.configKey, inputKey: key, value});
            },
            onAddArrayElement: function (inputKey) {
                const newVal = this.params[inputKey].value;
                newVal.push('');
                this.onSetParamValue(inputKey, newVal);
            },
            onDeleteArrayElement: function (inputKey, positionKey) {
                this.$store.commit(`${this.indexCommitPrefix}/deleteArrayElement`, {configKey: this.configKey, inputKey: inputKey, positionKey: positionKey})
            },
            onDeleteKey: function (inputKey) {
                this.$store.commit(`${this.indexCommitPrefix}/deleteParam`, {configKey: this.configKey, inputKey: inputKey});
            },
            onRestoreKey: function (inputKey) {
                this.$store.commit(`${this.indexCommitPrefix}/restoreIndexSetting`, {panelKey: this.panelKey, inputKey: inputKey})
            },
        }
    }
</script>
