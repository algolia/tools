<template>
    <div v-if="Object.keys(group).length > 0" class="my-24">
        <h2 class="text-solstice-blue-opacity-80">
            {{groupName}}
        </h2>
        <div v-for="cluster in Object.keys(group).sort((a, b) => { return a.localeCompare(b); })" class="mt-16">
            <div class="text-lg">
                <a
                    :href="`https://metrics.wavefront.com/dashboard/cluster-analysis#(p:(cluster:(l:'Cluster%20regex',v:'${group[cluster].cluster}-*'),cluster-name:${group[cluster].cluster}))`"
                    target="_blank"
                    class="text-nebula-blue cursor-pointer hover:underline"
                >{{group[cluster].cluster}}</a>
                <span v-if="group[cluster].dsns.length > 0">
                    |
                    <span v-for="dsn in group[cluster].dsns">
                        <a
                            :href="`https://metrics.wavefront.com/dashboard/cluster-analysis#(p:(cluster:(l:'Cluster%20regex',v:'${dsn}-*'),cluster-name:${dsn}))`"
                            target="_blank"
                            class="text-nebula-blue cursor-pointer hover:underline"
                        >{{dsn}}</a><span v-if="dsn !== group[cluster].dsns[group[cluster].dsns.length - 1]">,&nbsp;</span>
                    </span>&nbsp;|
                    <a
                        :href="`https://metrics.wavefront.com/dashboards/cluster-analysis#_v01(p:(cluster:(l:'Cluster%20regex',v:'${cluster
                        .cluster}-*${group[cluster].dsns.map((dsn) => `%20or%20source=${dsn}-*`).join('')}'),cluster-name:${group[cluster].cluster}))`"
                        target="_blank"
                        class="text-nebula-blue cursor-pointer hover:underline"
                    >all</a>
                </span>
            </div>
            <div class="ml-12">
                <div v-for="(user, email) in group[cluster].users" class="mb-8">
                    <div>{{user.company}} ({{user.email}})</div>
                    <div>
                        <span v-for="app in user.apps">
                            <a
                                :href="app.adminUrl"
                                target="_blank"
                                class="text-nebula-blue cursor-pointer hover:underline"
                            >{{app.appId}}</a>
                            <span v-if="app.appId !== user.apps[user.apps.length - 1].appId">,&nbsp;</span>
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
