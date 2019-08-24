<template>
    <custom-select
        :value="value"
        @input="onInput"
        class="min-w-140 border-b border-telluric-blue-opacity-60 text-solstice-blue pb-4"
        :options="Object.keys(apps)"
    >
        <template slot="icon"><box-icon class="block w-12 h-12 -mt-1 mr-8 fill-current"/></template>
        <template v-slot:default="{option, inDropDown, isSelected}">
            <div>
                <div>
                    {{option}}
                    <span v-if="inDropDown && apps[option].__app_name">
                            &nbsp;- {{apps[option].__app_name}}
                        </span>
                </div>
                <div v-if="inDropDown && apps[option].__app_owner" :class="!isSelected ? 'text-solstice-blue-opacity-60' : ''">
                    {{apps[option].__app_owner}}
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
        computed: {
            apps: function () {
                return this.$store.state.apps;
            }
        },
        created: function () {
            if (this.value) this.$store.commit("apps/addAppId", {appId: this.value});
        },
        methods: {
            onInput: function (e) {
                this.$emit('input', e);
                this.$store.commit("apps/addAppId", {appId: e});
            },
        }
    }
</script>