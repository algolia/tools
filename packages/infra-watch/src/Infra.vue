<template>
    <div class="hit mt-24 pb-12 border-b border-proton-grey-opacity-40">
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
                <div :class="{'mt-12': i > 0}" v-for="(k, i) in ['clusters', 'dsns']">
                    <div class="flex" v-if="infra[k].length > 0" v-for="machine in infra[k]">
                        <div
                            class="w-80 mr-8 px-4 py-2 rounded text-center"
                            :class="{'bg-mars-1-opacity-40': infra.failingMachines.includes(machine)}"
                            v-html="machine"
                        ></div>
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
            <div class="flex-grow">
                <table class="w-full">
                    <template v-for="(user, email) in infra.users">
                        <tr :class="{'border-t border-proton-grey-opacity-40': Object.keys(infra.users)[0] !== email}">
                            <td
                                class="w-50p align-top"
                                :class="{
                                    'py-8': Object.keys(infra.users)[0] !== email,
                                    'pb-8': Object.keys(infra.users)[0] === email,
                                }"
                            >
                                <div v-html="user.company"></div>
                                <div v-html="user.email"></div>
                            </td>
                            <td
                                class="w-50p align-top"
                                :class="{
                                    'py-8': Object.keys(infra.users)[0] !== email,
                                    'pb-8': Object.keys(infra.users)[0] === email,
                                }"
                            >
                                <template v-for="(app, i) in user.apps">
                                    <div class="flex">
                                        <div class="w-half">
                                            <a
                                                :href="app.adminUrl"
                                                target="_blank"
                                                class="hit link text-nebula-blue cursor-pointer hover:underline"
                                                v-html="app.appId"
                                            ></a>
                                        </div>
                                        <div class="w-half">
                                            <span v-if="app.appName" v-html="app.appName"></span>
                                        </div>
                                    </div>
                                </template>
                            </td>
                        </tr>
                    </template>
                </table>
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
                const allMachines = machines.map((m) => m.replace(/<\/?em>/g, ''));
                const mainMachine = allMachines.shift();
                return `https://metrics.wavefront.com/dashboards/cluster-analysis#_v01(p:(cluster:(l:'Cluster%20regex',v:'${mainMachine}-*${allMachines.map((m) => `%20or%20source=${m}-*`).join('')}'),cluster-name:${mainMachine}))`
            },
            generateInfraBookingLink: function (machine) {
                return `https://infrabooking.algolia.com/infra/clusters?query=${machine.replace(/<\/?em>/g, '')}`;
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
            },
        }
    }
</script>
