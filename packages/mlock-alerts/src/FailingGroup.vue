<template>
    <div v-if="Object.keys(group).length > 0" class="my-24">
        <h2 class="text-solstice-blue-opacity-80">
            {{groupName}}
        </h2>
        <div v-for="cluster in Object.keys(group).sort((a, b) => { return a.localeCompare(b); })" class="mt-24 pb-12 border-b border-proton-grey-opacity-40">
            <div class="flex">
                <div class="w-third">
                    <div v-for="(user, email) in group[cluster].users" class="mb-8">
                        <div>{{user.company}}</div>
                        <div>{{user.email}}</div>
                        <div>
                            <div v-for="app in user.apps">
                                <a
                                    :href="app.adminUrl"
                                    target="_blank"
                                    class="text-nebula-blue cursor-pointer hover:underline"
                                >{{app.appId}}</a>
                                <span v-if="app.appId !== user.apps[user.apps.length - 1].appId">,&nbsp;</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <div class="flex" v-if="group[cluster].dsns.length > 0">
                        <span class="w-60">all</span>
                        <a
                            :href="`https://metrics.wavefront.com/dashboards/cluster-analysis#_v01(p:(cluster:(l:'Cluster%20regex',v:'${group[cluster]
                    .cluster}-*${group[cluster].dsns.map((dsn) => `%20or%20source=${dsn}-*`).join('')}'),cluster-name:${group[cluster].cluster}))`"
                            target="_blank"
                            class="text-nebula-blue cursor-pointer hover:underline"
                        >Wavefront</a>
                    </div>
                    <div class="flex">
                        <span class="w-60">{{group[cluster].cluster}}</span>
                        <a
                            :href="`https://metrics.wavefront.com/dashboard/cluster-analysis#(p:(cluster:(l:'Cluster%20regex',v:'${group[cluster].cluster}-*'),cluster-name:${group[cluster].cluster}))`"
                            target="_blank"
                            class="text-nebula-blue cursor-pointer hover:underline"
                        >
                            Wavefront
                        </a>
                        <a
                            :href="`https://infrabooking.algolia.com/infra/clusters?query=${group[cluster].cluster}`"
                            target="_blank"
                            class="ml-12 text-nebula-blue cursor-pointer hover:underline"
                        >
                            InfraBooking
                        </a>
                    </div>
                    <div class="flex" v-if="group[cluster].dsns.length > 0" v-for="dsn in group[cluster].dsns">
                        <span class="w-60">{{dsn}}</span>
                        <a
                            :href="`https://metrics.wavefront.com/dashboard/cluster-analysis#(p:(cluster:(l:'Cluster%20regex',v:'${dsn}-*'),cluster-name:${dsn}))`"
                            target="_blank"
                            class="text-nebula-blue cursor-pointer hover:underline"
                        >Wavefront</a>
                        <a
                            :href="`https://infrabooking.algolia.com/infra/clusters?query=${dsn}`"
                            target="_blank"
                            class="ml-12 text-nebula-blue cursor-pointer hover:underline"
                        >
                            InfraBooking
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>

</template>

<script>
    export default {
        name: 'FailingGroup',
        props: ['group', 'groupName']
    }
</script>
