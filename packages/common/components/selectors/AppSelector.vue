<template>
    <custom-select
        v-model="appId"
        :value="appId"
        @input="$emit('input', appId)"
        class="min-w-140 mr-16"
        :options="Object.keys(apps)"
    >
        <template slot="icon"><box-icon class="block w-12 h-12 mr-8 fill-current"/></template>
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
        props: ['value', 'apps'], // Object.keys($store.state.apps)
        data: function () {
            return {
                appId: this.value,
            }
        }
    }
</script>