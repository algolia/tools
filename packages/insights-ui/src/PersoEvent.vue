<template>
    <div>
        <table>
            <tr class="tracking-wide text-xs uppercase text-cosmos-black-opacity-70">
                <td class="py-8 pr-32">User Token</td>
                <td class="py-8 pr-32">Event Name</td>
                <td class="py-8 pr-32">Event Type</td>
                <td class="py-8 pr-32">Objects Ids</td>
                <td class="py-8 pr-32">Filters</td>
            </tr>
            <tr class="border-t border-proton-grey-opacity-20">
                <td class="py-8 pr-32">
                    <input
                        v-model="userToken"
                        class="h-full px-16 py-8 bg-transparent text-telluric-blue leading-normal bg-white rounded border border-proton-grey-opacity-80"
                    />
                </td>
                <td class="py-8 pr-32">
                    <input
                        v-model="eventName"
                        class="h-full px-16 py-8 bg-transparent text-telluric-blue leading-normal bg-white rounded border border-proton-grey-opacity-80"
                    />
                </td>
                <td class="py-8 pr-32">
                    <template v-for="t in ['click', 'conversion', 'view']">
                        <label>
                            <input type="radio" v-model="eventType" :value="t" /> {{t}}
                        </label>
                        <br>
                    </template>
                </td>
                <td class="py-8 pr-32"></td>
                <td class="py-8 pr-32"></td>
            </tr>
        </table>
    </div>
</template>

<script>
    import aa from "search-insights";

    export default {
        name: 'PersoEvent',
        props: ['aa'],
        data: function () {
            return {
                eventType: 'click',
                eventName: '',
                userToken: '',
                filters: [],
                objectIDs: [],
            }
        },
        created: function () {
            this.$root.$on('onSelectEvent', (event) => {
                 this.eventType = event.eventType;
                 this.eventName = event.eventName;
            });
        },
        methods: {
            sendEvent: function () {
                aa.sendEvent(this.eventType, {
                    userToken: this.userToken || 'anonymous',
                    objectIDs: [objectID],
                    timestamp: new Date().getTime(),
                    index: this.indexName,
                    eventName: this.event.eventName,
                    queryID: this.searchResponse.queryID,
                });
            }
        }
    }
</script>
