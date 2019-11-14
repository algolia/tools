<template>
    <custom-select
        :value="value"
        @input="$emit('input', $event)"
        :options="options"
        class="text-solstice-blue text-sm border-b border-telluric-blue-opacity-60 pb-4"
    >
        <template slot="icon">
            <server-icon class="block -mt-1 mr-8 w-12 h-12"/>
        </template>
        <template v-slot:default="{option}">{{option}}</template>
    </custom-select>
</template>

<script>
    import ServerIcon from "common/icons/server.svg";
    import CustomSelect from "common/components/selectors/CustomSelect";
    import algoliasearch from 'algoliasearch';

    export default {
        name: 'ServerSelector',
        components: {ServerIcon, CustomSelect},
        props: ['appId', 'value', 'displayMainClusterMachines'],
        data: function () {
            const options = ['-dsn'];
            if (this.displayMainClusterMachines) {
                options.push('-1', '-2', '-3');
            }

            return {
                options,
            }
        },
        created: async function () {
            const client = algoliasearch('X20GSLY1CL', 'd33103a8d72e75e752cd0e92455fa27c');
            const index = client.initIndex('applications_production');

            const res = await index.search('', {filters: `application_id:${this.appId}`});

            if (res.hits.length > 0 && res.hits[0].clusters_and_replicas_names && res.hits[0].clusters_and_replicas_names.length > 1) {
                const replicas = res.hits[0].clusters_and_replicas_names.slice(1);
                this.options.push(...replicas);
            }
        },
    }
</script>
