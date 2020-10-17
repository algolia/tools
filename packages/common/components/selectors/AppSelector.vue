<template>
    <custom-select
        :value="value"
        @input="onInput"
        class="min-w-140 border-b border-telluric-blue-opacity-60 text-solstice-blue pb-4"
        :options="appIds"
        :refine="refine"
    >
        <template slot="icon"><box-icon class="block w-12 h-12 -mt-1 mr-8 fill-current"/></template>
        <template v-slot:default="{option, inDropDown, isSelected, highlightString}">
            <div>
                <div class="flex">
                    <div v-html="inDropDown ? highlightString(option) : option"></div>
                    <span v-if="inDropDown && apps[option].__app_name">
                        &nbsp;- <span v-html="highlightString(apps[option].__app_name)"></span>
                        </span>
                </div>
                <div
                    v-if="inDropDown && apps[option].__app_owner"
                    :class="!isSelected ? 'text-solstice-blue-opacity-60' : ''"
                    v-html="highlightString(apps[option].__app_owner)"
                >
                </div>
            </div>
        </template>
    </custom-select>
</template>

<script>
    import CustomSelect from './CustomSelect';
    import BoxIcon from '../../icons/box.svg';
    import ownedByAlgoliaMixin from "../../mixins/ownedByAlgolia";

    export default {
        name: 'AppSelector',
        components: {CustomSelect, BoxIcon},
        props: ['value', 'onlyAlgolia', 'forcedApps'],
        data: function () {
            return {
                query: '',
            };
        },
        mixins: [ownedByAlgoliaMixin],
        computed: {
            apiKey: function () {
                return this.$store.state.apps[this.appId] ? this.$store.state.apps[this.appId].key : '';
            },
            apps: function () {
                if (this.forcedApps) {
                    const apps = {};
                    Object.keys(this.$store.state.apps).forEach((appId) => {
                        if (this.forcedApps.includes(appId)) {
                            apps[appId] = this.$store.state.apps[appId];
                        }
                    });
                    return apps;
                }
                return this.$store.state.apps;
            },
            appIds: function () {
                const appIds = Object.keys(this.apps).filter((appId) => {
                    if (this.onlyAlgolia) return this.isOwner(appId);
                    return true;
                });

                if (this.query.length === 0) return appIds;

                const normalisedQuery = this.query.toLowerCase();

                return appIds.filter((appId) => {
                    if (this.apps[appId].__app_name && this.apps[appId].__app_name.toLowerCase().includes(normalisedQuery)) return true;
                    if (this.apps[appId].__app_owner && this.apps[appId].__app_owner.toLowerCase().includes(normalisedQuery)) return true;

                    return appId.toLowerCase().includes(normalisedQuery);
                });
            }
        },
        created: function () {
            if (this.value) {
                this.$store.commit("apps/addAppId", this.value);
            } else if (this.appIds.length > 0) {
                this.$emit('input', this.appIds[0]);
                this.$store.commit("apps/addAppId", this.appIds[0]);
            }
        },
        methods: {
            refine: function (query) {
                this.query = query;
            },
            onInput: function (e) {
                this.query = '';
                this.$emit('input', e);
                this.$store.commit("apps/addAppId", e);
            },
        }
    }
</script>
