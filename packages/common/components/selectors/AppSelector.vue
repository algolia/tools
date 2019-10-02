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

    export default {
        name: 'AppSelector',
        components: {CustomSelect, BoxIcon},
        props: ['value'],
        data: function () {
            return {
                query: '',
            };
        },
        computed: {
            apps: function () {
                return this.$store.state.apps;
            },
            appIds: function () {
                const appIds = Object.keys(this.apps);

                if (this.query.length === 0) return appIds;

                const query = this.query.toLowerCase();

                return appIds.filter((appId) => {
                    if (this.apps[appId].__app_name && this.apps[appId].__app_name.toLowerCase().includes(query)) return true;
                    if (this.apps[appId].__app_owner && this.apps[appId].__app_owner.includes(query)) return true;

                    return appId.includes(this.query)
                });
            }
        },
        created: function () {
            if (this.value) this.$store.commit("apps/addAppId", {appId: this.value});
        },
        methods: {
            refine: function (query) {
                this.query = query;
            },
            onInput: function (e) {
                this.query = '';
                this.$emit('input', e);
                this.$store.commit("apps/addAppId", {appId: e});
            },
        }
    }
</script>