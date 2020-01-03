<template>
    <div v-if="group.length > 0" class="my-24">
        <h2 class="text-solstice-blue-opacity-80">
            {{groupName}}
        </h2>
        <div v-for="element in group" class="mt-12">
            <div class="text-lg">
                <span v-for="cluster in element.clusters">
                    <a
                        :href="`https://metrics.wavefront.com/dashboard/cluster-analysis#(p:(cluster:(l:'Cluster%20regex',v:'${cluster}-*'),cluster-name:${cluster}))`"
                        target="_blank"
                        class="text-nebula-blue cursor-pointer hover:underline"
                    >{{cluster}}</a>&nbsp;
                </span>
            </div>
            <div v-for="app in element.apps" class="mt-4 ml-12">
                <a
                    :href="app.adminUrl"
                    target="_blank"
                    class="text-nebula-blue cursor-pointer hover:underline"
                >{{app.appId}}</a>
                - {{app.company}} ({{app.email}})
            </div>
        </div>
        <div></div>
        <!--<pre>{{JSON.stringify(group, null, 2)}}</pre>-->
    </div>

</template>

<script>
    export default {
        name: 'FailingGroup',
        props: ['group', 'groupName']
    }
</script>
