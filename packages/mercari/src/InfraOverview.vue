<template>
    <div class="flex">
        <div>
            <table>
                <tr class="border-b border-proton-grey-opacity-40">
                    <td class="p-8 align-top">appId</td>
                    <td v-for="app in apps" class="p-8 align-top">
                        {{app.application_id}}
                    </td>
                </tr>
                <tr class="border-b border-proton-grey-opacity-40">
                    <td class="p-8 align-top">appName</td>
                    <td v-for="app in apps" class="p-8 align-top">
                        {{app.name}}
                    </td>
                </tr>
                <tr class="border-b border-proton-grey-opacity-40">
                    <td class="p-8 align-top">Infra</td>
                    <td v-for="app in apps" class="p-8 align-top">
                        <div>{{app.nbClusters}} clusters</div>
                        <div class="mb-12">{{app.nbDsns}} DSNs</div>
                        <div v-for="cluster in app.clusters_and_replicas_names">{{cluster}}</div>
                    </td>
                </tr>
                <tr class="border-b border-proton-grey-opacity-40">
                    <td class="p-8 align-top">Number of indices</td>
                    <td v-for="app in apps" class="p-8 align-top">
                        <div v-if="app.indices !== undefined">{{Object.keys(app.indices).length}} {{Object.keys(app.indices).length > 1 ? 'indices': 'index'}}</div>
                        <div v-else class="">unregistered</div>
                    </td>
                </tr>
                <tr class="border-b border-proton-grey-opacity-40">
                    <td class="p-8 align-top">Total File size</td>
                    <td v-for="app in apps" class="p-8 align-top">
                        <div v-if="app.fileSize">{{formatHumanNumber(app.fileSize, 0, ['B', 'KB', 'MB', 'GB'], 1000)}}</div>
                        <div v-else class="">unregistered</div>
                    </td>
                </tr>
                <tr v-for="conf in config.engineConfs" class="border-b border-proton-grey-opacity-40">
                    <td class="p-8 align-top w-1    ">{{conf}}</td>
                    <td v-for="app in apps" class="p-8 align-top">
                        <span v-if="app.engine_configuration">
                            {{JSON.stringify(app.engine_configuration[conf])}}
                        </span>
                    </td>
                </tr>
            </table>
        </div>
    </div>
</template>

<script>
    import {formatHumanNumber} from "common/utils/formatters";

    export default {
        name: 'InfraOverview',
        props: ['apps', 'config'],
        data: function () {
            return {
                formatHumanNumber,
            }
        }
    }
</script>
