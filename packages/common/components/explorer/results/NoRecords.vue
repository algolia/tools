<template>
    <div class="my-32">
        <div class="text-nova-grey text-3xl text-center">No records in the index</div>
        <div class="mt-32">
            Import sample dataset:
            <div class="flex mt-8" v-if="!isUploadingDataset">
                <div
                    class="w-third text-center px-8 py-12 border border-proton-grey rounded mr-8 cursor-pointer"
                    @click="importDataset('movies.json')"
                >
                    Movies
                </div>
                <div
                    class="w-third text-center px-8 py-12 border border-proton-grey rounded mx-8 cursor-pointer"
                    @click="importDataset('contacts.json')"
                >
                    Contacts
                </div>
                <div
                    class="w-third text-center px-8 py-12 border border-proton-grey rounded ml-8 cursor-pointer"
                    @click="importDataset('bestbuy.json')"
                >
                    Best Buy
                </div>
            </div>
            <div v-if="isUploadingDataset" class="mt-8 flex items-center justify-center text-nova-grey-opacity-80 py-48">
                <loader-icon  class="w-24 h-24 infinte-rotate" />
                <div class="ml-16">Importing dataset</div>
            </div>
        </div>
        <div class="mt-32">
            Import JSON record(s) manually:
            <hit-edit
                :no-cancel="true"
                class="mt-8"
                v-bind="$props"
                v-on="$listeners"
            />
        </div>
    </div>
</template>

<script>
    import HitEdit from "../hits/HitEdit";
    import props from "../props";
    import {getSearchIndex} from "../../../utils/algoliaHelpers";
    import LoaderIcon from 'common/icons/loader.svg'

    export default {
        name: 'NoRecords',
        components: {HitEdit, LoaderIcon},
        props: [...props.credentials],
        data: function () {
            return {
                isUploadingDataset: false,
            }
        },
        methods: {
            importDataset: async function (fileName) {
                this.isUploadingDataset = true;
                const datasetUrl = `https://raw.githubusercontent.com/maxiloc/datasets/master/${fileName}`;
                const res = await fetch(datasetUrl);
                const records = await res.json();

                const index = await getSearchIndex(this.appId, this.apiKey, this.indexName, this.server, this.userId);
                await index.saveObjects(records, {autoGenerateObjectIDIfNotExist: true}).wait();
                this.$root.$emit('shouldTriggerSearch', this.indexName);
                this.isUploadingDataset = false;
            }
        }
    }
</script>
