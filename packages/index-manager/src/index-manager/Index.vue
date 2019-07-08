<template>
    <div>
        <div
            class="my-8 p-8 bg-white flex rounded border border-white cursor-pointer"
            :class="selected[indexInfo.name] ? 'border-neptune-4' : ''"
            @click="onClick"
            :style="mouseDown ? 'user-select: none' : ''"
            @mousedown.shift="mouseDown = true"
            @mouseup="mouseDown = false"
        >
            <div class="mr-8">
                <input :checked="selected[indexInfo.name]" type="checkbox" @change="$emit('onSelected', indexInfo, $event.target.checked)" />
            </div>
            <div class="flex-grow">
                {{indexInfo.name}}
            </div>
            <div class="ml-8">
                <div v-if="indexInfo.updatedAt">
                    {{timeFromNow(indexInfo.updatedAt)}}
                </div>
            </div>
            <div class="ml-8 w-64 text-right">
                <div v-if="indexInfo.entries !== undefined">
                    {{formatHumanNumber(indexInfo.entries)}}
                </div>
            </div>
            <div class="ml-8 w-64 text-right">
                <div v-if="indexInfo.nbSynonyms !== undefined">
                    {{formatHumanNumber(indexInfo.nbSynonyms)}}
                </div>
            </div>
            <div class="ml-8 w-64 text-right">
                <div v-if="indexInfo.nbRules !== undefined">
                    {{formatHumanNumber(indexInfo.nbRules)}}
                </div>
            </div>

            <!--<div class="ml-20 mt-8">
                <div v-for="resource in resources" :key="resource.id" class="flex">
                    <div>{{resource.name}}</div>
                </div>
            </div>-->
        </div>
        <div
            v-for="replica in indexInfo.replicas"
            :key="replica.name"
            class="flex items-center justify-center -my-8"
        >
            <div class="w-24 flex justify-center items-center">
                <div class="flex-no-shrink block w-8 h-8 mt-1 border-nebula-blue border-l border-b"></div>
            </div>
            <index
                :app-id="appId"
                :api-key="apiKey"
                :index-info="replica"
                :selected="selected"
                :key="replica.name"
                :parent-index-info="indexInfo"
                class="flex-grow"
                v-on="$listeners"
            />
        </div>

    </div>

</template>

<script>
    import {formatHumanNumber} from "common/utils/formatters";
    import {timeFromNow} from "common/utils/format_date";
    import customClient from "common/utils/customClient";

    export default {
        name: 'Index',
        props: ['appId', 'apiKey', 'indexInfo', 'selected', 'parentIndexInfo'],
        data: function () {
            return {
                client: null,
                index: null,
                mouseDown: false,
                /*resources: [
                    {name: 'Settings', id: `${this.index.name}-Settings`},
                    {name: 'Synonyms', id: `${this.index.name}-Synonyms`},
                    {name: 'Rules', id: `${this.index.name}-Rules`},
                ]*/
            }
        },
        watch: {
            parentSelected: function (val, oldVal) {
                this.$emit('onSelected', this.indexInfo, val);
            },
        },
        created: async function () {
            const client = await customClient(this.appId, this.apiKey);
            const index = client.initIndex(this.indexInfo.name);

            let indexInfo = {...this.indexInfo};
            if (this.indexInfo.updatedAt === undefined) {
                const data = await client.listIndexes('0&prefix=' + encodeURIComponent(this.indexInfo.name));
                indexInfo = data.items[0];
            }

            const settings = await index.getSettings();
            const rules = await index.searchRules();
            const synonyms = await index.searchSynonyms();

            const aggregatedInfo = {
                ...indexInfo,
                settings: settings,
                nbRules: rules.nbHits,
                nbSynonyms: synonyms.nbHits,
            };
            this.$emit('onAggregation', this.indexInfo, aggregatedInfo);
        },
        computed: {
            parentSelected: function () {
                if (!this.parentIndexInfo) return false;
                return !!this.selected[this.parentIndexInfo.name];
            },
        },
        methods: {
            formatHumanNumber,
            timeFromNow,
            onClick: function (event) {
                const selected = !this.selected[this.indexInfo.name];
                if (event.shiftKey && selected) {
                    event.preventDefault();
                    this.$emit('onSelectedRange', this.indexInfo, selected);
                } else {
                    this.$emit('onSelected', this.indexInfo, selected);
                }
            },
        }
    }
</script>