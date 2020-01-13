<template>
    <div v-if="Object.keys(group).length > 0" class="my-24">
        <h2 class="text-solstice-blue-opacity-80">
            {{groupName}}
        </h2>
        <div v-for="(cluster, _) in group" class="mt-16">
            <div class="text-lg">
                <a
                    :href="`https://metrics.wavefront.com/dashboard/cluster-analysis#(p:(cluster:(l:'Cluster%20regex',v:'${cluster.cluster}-*'),cluster-name:${cluster.cluster}))`"
                    target="_blank"
                    class="text-nebula-blue cursor-pointer hover:underline"
                >
                    {{cluster.cluster}}
                </a>
                <span v-if="cluster.dsns.length > 0">
                    |
                    <span v-for="dsn in cluster.dsns">
                        <a
                            :href="`https://metrics.wavefront.com/dashboard/cluster-analysis#(p:(cluster:(l:'Cluster%20regex',v:'${dsn}-*'),cluster-name:${dsn}))`"
                            target="_blank"
                            class="text-nebula-blue cursor-pointer hover:underline"
                        >
                            {{dsn}}
                        </a>
                    </span>
                    |
                    <a
                        :href="`https://metrics.wavefront.com/dashboards/cluster-analysis#_v01(p:(cluster:(l:'Cluster%20regex',v:'${cluster
                        .cluster}-*${cluster.dsns.map(() => '%20or%20source=t25-usw-*').join('')}'),cluster-name:${cluster.cluster}))`"
                        target="_blank"
                        class="text-nebula-blue cursor-pointer hover:underline"
                    >
                            all
                    </a>
                </span>
            </div>
            <div class="ml-12">
                <div v-for="(user, email) in cluster.users" class="mb-8">
                    <div>{{user.company}} ({{user.email}})</div>
                    <div>
                        <span v-for="app in user.apps">
                            <a
                                :href="app.adminUrl"
                                target="_blank"
                                class="text-nebula-blue cursor-pointer hover:underline"
                            >
                                {{app.appId}}
                            </a>
                        </span>
                    </div>
                </div>
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
