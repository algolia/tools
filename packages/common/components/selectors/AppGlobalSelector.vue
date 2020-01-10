<template>
    <custom-select
        :value="value"
        string-value-attribute="application_id"
        @input="onInput"
        class="min-w-140 border-b border-telluric-blue-opacity-60 text-solstice-blue pb-4"
        :options="apps"
        :refine="refine"
    >
        <template slot="icon"><box-icon class="block w-12 h-12 -mt-1 mr-8 fill-current"/></template>
        <template v-slot:default="{option, inDropDown, isSelected, highlightString}">
            <div v-if="option">
                <div class="flex">
                    <div v-html="inDropDown ? option._highlightResult.application_id.value : option.application_id"></div>
                    <span
                        v-if="inDropDown && option.name"
                    >
                        &nbsp;- <span v-html="option._highlightResult.name.value"></span>
                    </span>
                </div>
                <div
                    v-if="inDropDown && option.user_email"
                    :class="!isSelected ? 'text-solstice-blue-opacity-60' : ''"
                    v-html="option._highlightResult.user_email.value"
                >
                </div>
            </div>
        </template>
    </custom-select>
</template>

<script>
    import {getKey} from "./getClusterList";
    import algoliasearch from "algoliasearch";

    import CustomSelect from './CustomSelect';
    import BoxIcon from '../../icons/box.svg';

    let index;

    export default {
        name: 'AppGlobalSelector',
        components: {CustomSelect, BoxIcon},
        props: ['value'],
        data: function () {
            return {
                apps: [],
                query: '',
            };
        },
        created: async function () {
            const key = await getKey();
            const client = algoliasearch('X20GSLY1CL', key);
            index = client.initIndex('applications_production');
            this.fetchApps();
        },
        methods: {
            fetchApps: async function () {
                const res = await index.search(this.query);
                this.apps = Object.freeze(res.hits);
            },
            refine: function (query) {
                this.query = query;
                this.fetchApps();
            },
            onInput: function (e) {
                this.query = '';
                this.$emit('input', e);
            }
        }
    }
</script>
