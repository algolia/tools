<template>
    <div class="flex">
        <div class="w-third">
            <div v-for="[label, machines] in shortcuts(infra)">
                <div class="flex" v-if="machines.length > 1">
                            <span
                                class="w-80 mr-8 px-4 py-2 rounded text-center"
                            >
                                {{label}}
                            </span>
                    <a
                        :href="generateWaveFrontLink(machines)"
                        target="_blank"
                        class="text-nebula-blue cursor-pointer hover:underline py-2"
                    >
                        Wavefront
                    </a>
                </div>
            </div>
            <div class="mt-12" v-for="k in ['clusters', 'dsns']">
                <div class="flex" v-if="infra[k].length > 0" v-for="machine in infra[k]">
                    <div
                        class="w-80 mr-8 px-4 py-2 rounded text-center"
                        :class="{'bg-mars-1-opacity-40': infra.failingMachines.includes(machine)}"
                    >
                        {{machine}}
                    </div>
                    <a
                        :href="generateWaveFrontLink([machine])"
                        target="_blank"
                        class="text-nebula-blue cursor-pointer hover:underline py-2"
                    >Wavefront</a>
                    <a
                        :href="generateInfraBookingLink(machine)"
                        target="_blank"
                        class="ml-12 text-nebula-blue cursor-pointer hover:underline py-2"
                    >
                        InfraBooking
                    </a>
                </div>
            </div>
        </div>
        <div>
            <div v-for="(user, email) in infra.users" class="mb-16">
                <div>{{user.company}}</div>
                <div>{{user.email}}</div>
                <div class="mt-8">
                    <table>
                        <tr v-for="app in user.apps">
                            <td>
                                <a
                                    :href="app.adminUrl"
                                    target="_blank"
                                    class="text-nebula-blue cursor-pointer hover:underline"
                                >
                                    {{app.appId}}
                                </a>
                            </td>
                            <td>
                                <span v-if="app.appName">- {{app.appName}}</span>
                            </td>
                        </tr>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'Infra',
        props: ['infra'],
        methods: {
            generateWaveFrontLink: function (machines) {
                const allMachines = machines.slice();
                const mainMachine = allMachines.shift();
                return `https://metrics.wavefront.com/dashboards/cluster-analysis#_v01(p:(cluster:(l:'Cluster%20regex',v:'${mainMachine}-*${allMachines.map((m) => `%20or%20source=${m}-*`).join('')}'),cluster-name:${mainMachine}))`
            },
            generateInfraBookingLink: function (machine) {
                return `https://infrabooking.algolia.com/infra/clusters?query=${machine}`;
            },
            shortcuts: function (infra) {
                const shortcuts = [];
                if (infra.allMachines.length > 1) {
                    shortcuts.push(['all', infra.allMachines]);
                }
                if (infra.clusters.length > 1 && infra.clusters < infra.allMachines) {
                    shortcuts.push(['clusters', infra.clusters]);
                }
                if (infra.dsns.length > 1 && infra.clusters < infra.allMachines) {
                    shortcuts.push(['DSNs', infra.dsns]);
                }
                if (infra.failingMachines.length > 1) {
                    shortcuts.push(['all failing', infra.failingMachines]);
                }

                return shortcuts;
            }
        }
    }
</script>
