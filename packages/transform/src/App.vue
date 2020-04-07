<template>
    <internal-app>
        <div class="min-h-screen pb-48">
            <app-header app-name="Transform">
                <display-config class="mx-16 mt-0 ml-auto" />
            </app-header>
            <div class="px-48 mt-24">
                <app-management />
                <dataset-selector
                    @onUpdateDataset="dataset = $event"
                    @onUpdateIndexInfo="indexInfo = $event"
                    @onUpdateCsvFile="csvFile = $event"
                    @onUpdateJsonFile="jsonFile = $event"
                    @onUpdateXmlFile="xmlFile = $event"
                    @onUpdateXmlRootNode="xmlRootNode = $event"
                />
                <transformer
                    v-if="dataset"
                    :dataset="dataset"
                    @onUpdateTransformer="transformer = $event"
                />
                <applier
                    v-if="dataset && transformer"
                    :dataset="dataset"
                    :index-info="indexInfo"
                    :transformer="transformer"
                    :csv-file="csvFile"
                    :json-file="jsonFile"
                    :xml-file="xmlFile"
                    :xml-root-node="xmlRootNode"
                />
            </div>
        </div>
    </internal-app>
</template>

<script>
    import InternalApp from "common/components/app/InternalApp";
    import AppHeader from "common/components/header/AppHeader";
    import AppManagement from "common/components/configuration/AppManagement";
    import DatasetSelector from "./DatasetSelector";
    import Transformer from "./Transformer";
    import Applier from "./Applier";
    import DisplayConfig from "./DisplayConfig";

    export default {
        name: 'App',
        components: {Applier, Transformer, DatasetSelector, InternalApp, AppHeader, AppManagement, DisplayConfig},
        data: function () {
            return {
                transformer: null,
                dataset: null,
                indexInfo: null,
                csvFile: null,
                jsonFile: null,
                xmlFile: null,
                xmlRootNode: 'item',
            }
        }
    }
</script>
