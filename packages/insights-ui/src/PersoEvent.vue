<template>
    <div v-if="persoEnabled">
        <h3 class="text-solstice-blue-opacity-80 mt-48 mb-16">Send Event</h3>
        <table>
            <tr class="tracking-wide text-xs uppercase text-cosmos-black-opacity-70">
                <td class="py-8 pr-32">User Token</td>
                <td class="py-8 pr-32">Event Name</td>
                <td class="py-8 pr-32">Event Type</td>
                <td class="py-8 pr-32">
                    <span v-if="nonEmptyFilters.length === 0">Objects Ids</span>
                    <span v-if="nonEmptyFilters.length === 0 && nonEmptyObjectIDs.length === 0">/</span>
                    <span v-if="nonEmptyObjectIDs.length === 0">Filters</span>
                </td>
            </tr>
            <tr class="border-t border-proton-grey-opacity-20">
                <td class="py-8 pr-32 align-top">
                    <input
                        v-model="userToken"
                        class="h-full px-8 py-4 bg-transparent text-telluric-blue text-sm leading-normal bg-white rounded border border-proton-grey-opacity-80"
                    />
                </td>
                <td class="py-8 pr-32 align-top">
                    <input
                        v-model="eventName"
                        class="h-full px-8 py-4 bg-transparent text-telluric-blue text-sm leading-normal bg-white rounded border border-proton-grey-opacity-80"
                    />
                </td>
                <td class="py-8 pr-32 align-top">
                    <template v-for="t in ['click', 'conversion', 'view']">
                        <label>
                            <input type="radio" v-model="eventType" :value="t" /> {{t}}
                        </label>
                        <br>
                    </template>
                </td>
                <td class="py-8 pr-32 align-top">
                    <div v-if="nonEmptyFilters.length === 0">
                        <div
                            v-for="(objectID, i) in objectIDs"
                            class="mb-8 flex items-center"
                        >
                            <hit-autocomplete
                                :ref="`input-object-id-${i}`"
                                :params="{hitsPerPage: 4, enableRules: false}"
                                input-classes="h-full px-8 py-4 bg-transparent text-telluric-blue text-sm leading-normal bg-white rounded border border-proton-grey-opacity-80"
                                v-model="objectIDs[i]"
                                placeholder="objectID"
                                :display-empty-query="true"
                                :image-size="indexImageSize"
                                :image-attribute="indexImageAttributeName"
                                :image-base-url="indexImageBaseUrl"
                                :image-suffix-url="indexImageSuffixUrl"
                                :title-attribute-name="indexTitleAttribute"
                                :auto-title-attribute-name="indexAutoTitleAttributeName"
                                :index-settings="indexSettings"
                                @onUpdateAutoTitleAttributeName="indexAutoTitleAttributeName = $event"
                                v-bind="$props"
                                v-on="$listeners"
                                @onSelected="$set(objectIDs, i, $event.objectID)"
                            />
                            <trash-icon
                                v-if="nonEmptyObjectIDs.length > 0"
                                @click="objectIDs.length > 1 ? objectIDs.splice(i, 1) : $set(objectIDs, i, '')"
                                class="cursor-pointer ml-8 w-12 h-12"
                            />
                        </div>
                        <div v-if="nonEmptyObjectIDs.length > 0">
                            <button
                                @click="objectIDs.push('')"
                                class="bg-white border border-b-0 border-proton-grey-opacity-40 rounded shadow-sm hover:shadow transition-fast-out px-16 p-8 text-sm"
                            >
                                Add objectID
                            </button>
                        </div>
                    </div>
                    <div v-if="nonEmptyObjectIDs.length === 0">
                        <div v-for="(filter, i) in filters">
                            <input
                                v-model="filters[i]"
                                placeholder="facetName:facetValue"
                                class="mb-8 h-full px-8 py-4 bg-transparent text-telluric-blue text-sm leading-normal bg-white rounded border border-proton-grey-opacity-80"
                            />
                            <trash-icon
                                v-if="nonEmptyFilters.length > 0"
                                @click="filters.length > 1 ? filters.splice(i, 1) : $set(filters, i, '')"
                                class="cursor-pointer ml-8 w-12 h-12"
                            />
                        </div>
                        <div v-if="nonEmptyFilters.length > 0">
                            <button
                                @click="filters.push('')"
                                class="bg-white border border-b-0 border-proton-grey-opacity-40 rounded shadow-sm hover:shadow transition-fast-out px-16 p-8 text-sm"
                            >
                                Add filter
                            </button>
                        </div>
                    </div>
                </td>
            </tr>
            <tr class="tracking-wide text-xs uppercase text-cosmos-black-opacity-70">
                <td class="py-8 pr-32" colspan="4">
                    Generated Event
                </td>
            </tr>
            <tr class="border-t border-proton-grey-opacity-20">
                <td class="py-8 pr-32" colspan="4">
                    <pre>{{JSON.stringify(eventJson, null, 2)}}</pre>
                    <div class="mt-8 flex">
                        <button
                            v-if="isValidEvent"
                            @click="sendEvent()"
                            class="bg-white border border-b-0 border-proton-grey-opacity-40 rounded shadow-sm hover:shadow transition-fast-out px-16 p-8 text-sm"
                        >
                            Send perso event
                        </button>
                        <div v-else class="bg-mars-1-opacity-20 p-8 rounded">
                            Event is missing some fields. So it can not be sent
                        </div>
                    </div>
                </td>
            </tr>
        </table>
    </div>
</template>

<script>
    import aa from "search-insights";
    import HitAutocomplete from "common/components/autocomplete/HitsAutocomplete";
    import TrashIcon from "common/icons/trash.svg";
    import indexInfoMixin from "common/mixins/indexInfoMixin";

    export default {
        name: 'PersoEvent',
        components: {TrashIcon, HitAutocomplete},
        props: ['aa', 'appId', 'apiKey', 'indexName'],
        mixins: [indexInfoMixin],
        data: function () {
            return {
                eventType: 'click',
                eventName: '',
                userToken: '',
                filters: [''],
                objectIDs: [''],
                persoEnabled: true,
            }
        },
        created: function () {
            this.$root.$on('onSelectEvent', (event) => {
                 this.eventType = event.eventType;
                 this.eventName = event.eventName;
            });

            this.$root.$on('onSelectFacet', (facet) => {
                if (this.filters.length > 0 && this.filters[0].trim().length === 0) {
                    this.$set(this.filters, this.filters.length - 1, `${facet.facetName}:`);
                } else {
                    this.filters.push(`${facet.facetName}:`);
                }
                this.objectIDs = [''];
            });

            this.$root.$on('onPersoNotEnabled', () => {
                this.persoEnabled = false;
            });
        },
        computed: {
            nonEmptyFilters: function () {
                return this.filters.filter((f) => f.length > 0);
            },
            nonEmptyObjectIDs: function () {
                return this.objectIDs.filter((f) => f.length > 0);
            },
            isValidEvent: function () {
                return this.eventName.length > 0 && (this.nonEmptyFilters.length > 0 || this.nonEmptyObjectIDs.length > 0);
            },
            eventJson: function () {
                const event = {
                    eventName: this.eventName,
                    eventType: this.eventType,
                    index: this.indexName,
                    userToken: this.userToken || 'anonymous',
                    timestamp: new Date().getTime(),
                };

                if (this.nonEmptyFilters.length > 0) {
                    event.filters = this.nonEmptyFilters;
                } else {
                    event.objectIDs = this.nonEmptyObjectIDs;
                }

                return event;
            }
        },
        methods: {
            sendEvent: function () {
                aa.sendEvent(this.eventType, this.eventJson);
            },
        }
    }
</script>
