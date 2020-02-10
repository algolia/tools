<template>
    <div>
        <div v-if="strategy" class="flex">
            <div class="w-half">
                <h3 class="text-solstice-blue-opacity-80">Perso Events</h3>
                <table class="mt-24">
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
                <h3 class="text-solstice-blue-opacity-80">Perso Facets</h3>
                <table class="mt-24">
                    <tr class="tracking-wide text-xs uppercase text-cosmos-black-opacity-70">
                        <td class="py-8 pr-32">Facet Name</td>
                        <td class="py-8 pr-32">Facet Score</td>
                    </tr>
                    <tr class="border-t border-proton-grey-opacity-20" v-for="event in strategy.facetsScoring">
                        <td class="py-8 pr-32">{{event.facetName}}</td>
                        <td class="py-8 pr-32">{{event.score}}</td>
                    </tr>
                </table>
            </div>

        </div>
        <div v-else>
            No perso strategy found for appId: {{appId}}
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
                    console.error(e);
                }
            }
        }
    }
</script>
