<template>
    <internal-app>
        <div class="min-h-screen">
            <app-header app-name="Infra Watch" />
            <div class="max-w-960 mx-auto mt-24 pb-48">
                <div class="bg-white rounded border border-proton-grey-opacity-60">
                    <div
                        class="flex border-b border-proton-grey text-xs uppercase tracking-wide bg-proton-grey-opacity-40 text-telluric-blue"
                    >
                        <div
                            class="mx-8 p-8"
                            :class="`${currentTab === 'inspect' ? '-mb-2 border-b-2 border-nebula-blue-opacity-80' : 'cursor-pointer'}`"
                            @click="currentTab = 'inspect'"
                        >
                            Inspect
                        </div>
                        <div
                            class="mx-8 p-8"
                            :class="`${currentTab === 'mlocks' ? '-mb-2 border-b-2 border-nebula-blue-opacity-80' : 'cursor-pointer'}`"
                            @click="currentTab = 'mlocks'"
                        >
                            Mlocks alerts <span v-if="Object.keys(failing).length > 0">({{Object.keys(failing).length}})</span>
                        </div>
                        <div
                            class="mx-8 p-8"
                            :class="`${currentTab === 'busted' ? '-mb-2 border-b-2 border-nebula-blue-opacity-80' : 'cursor-pointer'}`"
                            @click="currentTab = 'busted'"
                        >
                            Busted
                        </div>
                    </div>
                    <div class="p-24">
                        <inspect v-if="currentTab === 'inspect'" />
                        <mlocks v-if="currentTab === 'mlocks'" :failing="failing" :recovered="recovered" />
                        <busted v-if="currentTab === 'busted'" />
                    </div>
                </div>
            </div>
        </div>
    </internal-app>
</template>

<script>
    import InternalApp from "common/components/app/InternalApp";
    import AppHeader from "common/components/header/AppHeader";
    import Mlocks from "./Mlocks";
    import Busted from "./Busted";
    import Inspect from "./Inspect";
    import {getMlockData} from "./helpers";

    export default {
        name: 'Home',
        components: {Inspect, Busted, Mlocks, InternalApp, AppHeader},
        data: function () {
            return {
                failing: {},
                recovered: {},
                currentTab: 'inspect'
            };
        },
        created: async function () {
            const mlockData = await getMlockData();
            this.failing = mlockData.failing;
            this.recovered = mlockData.recovered;
        },
    }
</script>
