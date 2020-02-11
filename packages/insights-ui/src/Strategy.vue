<template>
    <div>
        <div v-if="persoEnabled">
            <h3 class="text-solstice-blue-opacity-80 mt-8 mb-16">Current strategy info</h3>
            <div v-if="strategy" class="flex">
                <div class="w-half">
                    <table>
                        <tr class="tracking-wide text-xs uppercase text-cosmos-black-opacity-70">
                            <td class="py-8 pr-32">Event Name</td>
                            <td class="py-8 pr-32">Event Type</td>
                            <td class="py-8 pr-32">Event score</td>
                        </tr>
                        <tr class="border-t border-proton-grey-opacity-20" v-for="event in strategy.eventsScoring">
                            <td class="py-8 pr-32">
                            <span
                                @click="$root.$emit('onSelectEvent', event)"
                                class="text-nebula-blue cursor-pointer hover:underline"
                            >
                                {{event.eventName}}
                            </span>
                            </td>
                            <td class="py-8 pr-32">
                                {{event.eventType}}
                            </td>
                            <td class="py-8 pr-32">
                                {{event.score}}
                            </td>
                        </tr>
                    </table>
                </div>
                <div class="w-half">
                    <table>
                        <tr class="tracking-wide text-xs uppercase text-cosmos-black-opacity-70">
                            <td class="py-8 pr-32">Facet Name</td>
                            <td class="py-8 pr-32">Facet Score</td>
                        </tr>
                        <tr class="border-t border-proton-grey-opacity-20" v-for="facet in strategy.facetsScoring">
                            <td class="py-8 pr-32">
                            <span
                                @click="$root.$emit('onSelectFacet', facet)"
                                class="text-nebula-blue cursor-pointer hover:underline"
                            >
                                {{facet.facetName}}
                            </span>
                            </td>
                            <td class="py-8 pr-32">
                                {{facet.score}}
                            </td>
                        </tr>
                    </table>
                </div>

            </div>
            <div v-else>
                No perso strategy found for appId: {{appId}}
            </div>
        </div>
        <div v-if="!persoEnabled">
            <div class="bg-mars-1-opacity-20 p-8 rounded">
                Perso is not enabled on appId: {{appId}}
            </div>
        </div>
    </div>
</template>

<script>
    import {getClient} from "common/utils/algoliaHelpers";

    export default {
        name: 'Strategy',
        props: ['appId', 'apiKey'],
        data: function () {
            return {
                strategy: null,
                events: [],
                persoEnabled: true,
            }
        },
        created: function () {
            this.initialize();
        },
        methods: {
            initialize: async function () {
                if (!this.appId) return;

                const client = await getClient(this.appId, this.apiKey);
                const reco = client.initRecommendation();

                try {
                    const res = await reco.getPersonalizationStrategy();
                    this.strategy = res;
                } catch (e) {
                    if (e.status && e.status === 401) {
                        this.$root.$emit('onPersoNotEnabled');
                        this.persoEnabled = false;
                    }
                    console.error(e);
                }
            }
        }
    }
</script>
