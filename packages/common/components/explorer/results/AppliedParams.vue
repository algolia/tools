<template>
    <div class="mt-32" v-if="params">
        <div class="text-center text-sm uppercase tracking-wide">Applied Params</div>
        <div v-for="group in paramsGroups" class="mt-8">
            <div>
                {{group.name}}
                <span
                    class="text-nebula-blue cursor-pointer hover:underline"
                    @click="$set(active, group.key, !active[group.key])"
                >
                    {{ active[group.key] ? 'hide' : 'show'}} details
                </span>
            </div>
            <table
                v-if="active[group.key]"
                class="border-collapse bg-white border border-proton-grey-opacity-50 my-8 w-full"
            >
                <tr v-for="key in Object.keys(group.params).sort()">
                    <td class="p-8 border border-proton-grey-opacity-50 bg-moon-grey-opacity-50 w-172">
                        {{key}}
                    </td>
                    <td class="p-8 border border-proton-grey-opacity-50 bg-moon-grey-opacity-50 break-all">
                        {{JSON.stringify(group.params[key])}}
                    </td>
                </tr>
            </table>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'AppliedParams',
        props: ['algoliaResponse', 'searchParams'],
        data: function () {
            return {
                active: {},
            }
        },
        computed: {
            params: function () {
                if (this.algoliaResponse.explain && this.algoliaResponse.explain.match && this.algoliaResponse.explain.params) {
                    return this.algoliaResponse.explain.params;
                }
                return false;
            },
            paramsGroups: function () {
                const groups = [];
                groups.push({
                    key: 1,
                    name: `${Object.keys(this.userParams).length} params applied by you`,
                    params: this.userParams,
                });

                if (Object.keys(this.toolsParams).length > 0) {
                    groups.push({
                        key: 2,
                        name: `${Object.keys(this.toolsParams).length} params forced by metaparams`,
                        params: this.toolsParams,
                    });
                }

                if (Object.keys(this.rulesParams).length > 0) {
                    groups.push({
                        key: 3,
                        name: `${Object.keys(this.rulesParams).length} params applied by rules`,
                        params: this.rulesParams,
                    });
                }

                groups.push({
                    key: 4,
                    name: `${Object.keys(this.finalParams).length} final applied params`,
                    params: this.finalParams,
                });

                return groups;
            },
            finalParams: function () {
                return this.params.final;
            },
            userParams: function () {
                const query = this.clientParams ? this.clientParams.query : '';
                return {query, ...this.searchParams};
            },
            toolsParams: function () {
                const params = {};
                console.log(this.params, this.clientParams);
                Object.keys(this.clientParams).forEach((key) => {
                    if (this.userParams[key] === undefined) {
                        params[key] = this.clientParams[key];
                    }
                });

                return params;
            },
            clientParams: function() {
                return this.params.original;
            },
            rulesParams: function () {
                return this.params.rules;
            },
        }
    }
</script>