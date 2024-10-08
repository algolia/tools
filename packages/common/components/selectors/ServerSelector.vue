<template>
    <custom-select
        :value="value"
        @input="$emit('input', $event)"
        :options="options"
        class="text-solstice-blue text-sm border-b border-telluric-blue-opacity-60 pb-4"
    >
        <template v-slot:icon>
            <server-icon class="block -mt-1 mr-8 w-12 h-12"/>
        </template>
        <template v-slot:default="{option}">{{option}}</template>
    </custom-select>
</template>

<script>
    import ServerIcon from "common/icons/server.svg";
    import CustomSelect from "common/components/selectors/CustomSelect.vue";
    import getClusterList from "./getClusterList";

    export default {
        name: 'ServerSelector',
        components: {ServerIcon, CustomSelect},
        props: ['appId', 'value', 'displayMainCluster', 'displayMainClusterMachines', 'displayAllOption', 'displayDsn', 'displayAllClusters', 'resetOnChangeAppId'],
        data: function () {
            return {options: []};
        },
        created: function () {
            this.loadClusterList();
        },
        watch: {
            appId: async function () {
                if (this.resetOnChangeAppId) {
                    this.$emit('input', null);
                }
                await this.loadClusterList();
                if (this.value === null && this.options.length > 0) {
                    this.$emit('input', this.options[0]);
                }
            },
        },
        methods: {
            loadClusterList: async function () {
                const options = [];

                if (this.displayAllOption) options.push('all');
                if (this.displayMainCluster) options.push('main cluster');
                if (this.displayDsn) options.push('-dsn');
                if (this.displayMainClusterMachines) options.push('-1', '-2', '-3');

                const clusters = await getClusterList(this.appId, true);
                if (this.displayAllClusters) {
                    this.options = [...options, ...clusters];
                } else {
                    this.options = [...options, ...clusters.slice(1)];
                }
            }
        }
    }
</script>
