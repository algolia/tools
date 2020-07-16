<template>
    <internal-app>
        <div class="min-h-screen pb-24">
            <app-header app-name="V8" />
            <div class="mx-24 mt-24">
                <div class="flex">
                    <div class="w-third">
                        <load />
                        <div class="mt-24 mr-12 bg-white rounded border border-proton-grey-opacity-80">
                            <div class="p-8 border-b border-proton-grey text-xs uppercase tracking-wide bg-proton-grey-opacity-40 text-telluric-blue">
                                Variables
                            </div>
                            <div class="m-16">
                                <table>
                                    <tr class="border-b border-proton-grey-opacity-40">
                                        <td class="p-8 pl-0 align-top">Nb Search Requests</td>
                                        <td class="p-8 pt-4 align-top">
                                            <input class="input-custom p-4 inline" type="number" v-model.number="nbSearchRequests">
                                        </td>
                                        <td class="p-8">
                                            <div>{{formatHumanNumber(nbSearchRequests, 2)}}/year</div>
                                            <div>{{formatHumanNumber(Math.ceil(nbSearchRequests / 12), 2)}}/month</div>
                                            <div>{{formatHumanNumber(Math.ceil(nbSearchRequests / 12 / 30), 2)}}/day</div>
                                            <div>{{formatHumanNumber(Math.ceil(nbSearchRequests / 12 / 30 / 24 / 3600), 2)}}/sec</div>
                                        </td>
                                    </tr>
                                    <tr class="border-b border-proton-grey-opacity-40">
                                        <td class="p-8 pl-0">Nb Records</td>
                                        <td class="p-8 pt-4 align-top">
                                            <input class="input-custom p-4 inline" type="number" v-model.number="nbRecords">
                                        </td>
                                        <td class="p-8">
                                            <div>{{formatHumanNumber(nbRecords, 2)}}</div>
                                        </td>
                                    </tr>
                                    <tr class="border-b border-proton-grey-opacity-40">
                                        <td class="p-8 pl-0">Nb Dedicated cluster</td>
                                        <td class="p-8 pt-4 align-top">
                                            <input class="input-custom p-4 inline" type="number" v-model.number="nbDedicatedCluster" :min="0">
                                        </td>
                                        <td class="p-8"></td>
                                    </tr>
                                    <tr class="border-b border-proton-grey-opacity-40">
                                        <td class="p-8 pl-0">Nb DSNs</td>
                                        <td class="p-8 pt-4 align-top">
                                            <input class="input-custom p-4 inline" type="number" v-model.number="nbDsn" :min="0">
                                        </td>
                                        <td class="p-8"></td>
                                    </tr>
                                </table>
                                <div class="mt-20">
                                    <h3 class="mb-4">Plan</h3>
                                    <div>
                                        <div>
                                            <input type="checkbox" v-model="hasPremium">&nbsp;
                                            Premium plan (Rules, Visual Merch, Perso)
                                        </div>
                                        <table>
                                            <tr>
                                                <td>

                                                </td>
                                                <td></td>
                                            </tr>
                                            <tr>

                                            </tr>
                                        </table>
                                    </div>
                                </div>
                                <div class="flex mt-20">
                                    <div>
                                        <h3 class="mb-4">Addons</h3>
                                        <div>
                                            <label>
                                                <input type="checkbox" v-model="enterprisePackage" />&nbsp; Enterprise Package
                                            </label>
                                        </div>
                                        <div v-for="addon in planInfo.addons">
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    :checked="selectedAddons.includes(addon.key)"
                                                    @change="selectedAddons.includes(addon.key) ? selectedAddons.splice(selectedAddons.findIndex((k) => k === addon.key), 1) : selectedAddons.push(addon.key)"
                                                    :disabled="enterprisePackage && addon.partOfEnterprisePackage" />&nbsp;
                                                <span :class="{'line-through': enterprisePackage && addon.partOfEnterprisePackage}">{{addon.name}}</span>&nbsp;
                                                <span v-if="enterprisePackage && addon.partOfEnterprisePackage">Included in enterprise package</span>
                                            </label>
                                        </div>
                                    </div>
                                    <div class="ml-48">
                                        <h3 class="mb-4">Packages</h3>
                                        <div v-for="pack in planInfo.packages">
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    :checked="selectedPackages.includes(pack.key)"
                                                    @change="selectedPackages = []; selectedPackages.push(pack.key)"
                                                    :disabled="enterprisePackage && pack.partOfEnterprisePackage" />&nbsp;
                                                <span :class="{'line-through': enterprisePackage && pack.partOfEnterprisePackage}">{{pack.name}}</span>&nbsp;
                                                <span v-if="enterprisePackage && pack.partOfEnterprisePackage">Included in enterprise package</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="flex m-8 mb-16">
                                <button
                                    @click="resetScoping"
                                    class="ml-auto block bg-white rounded border border-proton-grey-opacity-40 shadow-sm hover:shadow transition-fast-out mr-8 px-16 p-8 text-sm relative group"
                                >
                                    Reset scoping
                                </button>
                            </div>
                        </div>
                        <backup :scoping="scoping" @onUpdateScoping="onUpdateScoping" />
                    </div>
                    <div class="flex-grow ml-12">
                        <div class="bg-white rounded border border-proton-grey-opacity-80">
                            <div class="p-8 border-b border-proton-grey text-xs uppercase tracking-wide bg-proton-grey-opacity-40 text-telluric-blue">
                                Cost
                            </div>
                            <div class="m-16">
                                <cost
                                    :nbUnitBasedOnSearch="nbUnitBasedOnSearch(true)"
                                    :nbUnitBasedOnRecords="nbUnitBasedOnRecords(true)"
                                    :total-usage="totalUsage"
                                    :total-addons="totalAddons"
                                    :addons="addons"
                                    :enterprise-package="enterprisePackage"
                                    :enterprise-package-price="enterprisePackagePrice"
                                    :nb-dsn="nbDsn"
                                    :total-dsns="totalDsns"
                                    :nb-dedicated-cluster="nbDedicatedCluster"
                                    :total-dedicated-clusters="totalDedicatedClusters"
                                    :total-list-price="totalListPrice"
                                    :discount="discount"
                                    :total-sales-price="totalSalesPrice"
                                    :total-packages="totalPackages"
                                    @onUpdateDiscount="discount = $event"
                                />
                            </div>
                        </div>
                        <div class="mt-24 bg-white rounded border border-proton-grey-opacity-80">
                            <div class="p-8 border-b border-proton-grey text-xs uppercase tracking-wide bg-proton-grey-opacity-40 text-telluric-blue">
                                Usage details
                            </div>
                            <div class="m-16 flex">
                                <div>
                                    <h3>
                                        Yearly commit
                                    </h3>
                                    <tranches
                                        :units-per-tranche="unitsPerTrancheCommitted"
                                        :is-committed="true"
                                        :nbUnit="nbUnit(true)"
                                    />
                                </div>
                                <div class="ml-48">
                                    <h3>Pay as you go</h3>
                                    <div>
                                        <tranches
                                            :units-per-tranche="unitsPerTranchePayAsYouGo"
                                            :is-committed="false"
                                            :nbUnit="nbUnit(false)"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </internal-app>
</template>

<script>
    import InternalApp from "common/components/app/InternalApp";
    import AppHeader from "common/components/header/AppHeader";
    import SearchIcon from "common/icons/search.svg";

    import planInfo from "./planInfo";
    import Tranches from "./Tranches";
    import Cost from "./Cost";
    import {formatHumanNumber} from "common/utils/formatters";
    import {getKey} from "common/components/selectors/getClusterList";
    import algoliasearch from "algoliasearch";
    import Backup from "./Backup";
    import Load from "./Load";

    export default {
        name: 'V8Simulator',
        components: {Load, Backup, Cost, Tranches, InternalApp, AppHeader, SearchIcon},
        data: function () {
            return {
                nbSearchRequests: 0,
                nbRecords: 0,
                hasPremium: false,
                enterprisePackage: false,
                nbDsn: 0,
                nbDedicatedCluster: 0,
                discount: 0,
                selectedAddons: [],
                selectedPackages: [],

                planInfo: Object.freeze(planInfo),
                formatHumanNumber: formatHumanNumber,
            }
        },
        watch: {
            'enterprisePackage': function (val) {
                if (val) {
                    this.selectedAddons.splice(this.selectedAddons.findIndex((k) => k === 'premier_support'), 1);
                    this.selectedPackages.splice(this.selectedPackages.findIndex((k) => k === 'intro_onboarding'), 1);
                }
            },
        },
        computed: {
            unitsPerTrancheCommitted: function () {
                return this.computeTranches(this.nbUnit(true), true);
            },
            unitsPerTranchePayAsYouGo: function () {
                return this.computeTranches(this.nbUnit(false), false);
            },
            totalUsage: function () {
                return this.unitsPerTrancheCommitted[this.unitsPerTrancheCommitted.length - 1].totalCost;
            },
            enterprisePackagePrice: function () {
              return Math.max(72000, Math.ceil(this.totalUsage * 30 / 100));
            },
            addons: function () {
                return this.planInfo.addons.filter((a) => this.selectedAddons.includes(a.key));
            },
            totalDsns: function () {
                return Math.ceil(this.totalUsage * 30 / 100 * this.nbDsn);
            },
            totalDedicatedClusters: function () {
                return this.nbDedicatedCluster * this.planInfo.dedicatedClusterPrice;
            },
            totalAddons: function () {
                let total = this.addons.reduce((acc, v) => acc + v.price, 0);
                if (this.enterprisePackage) {
                    total += this.enterprisePackagePrice;
                }
                if (this.nbDsn > 0) {
                    total += this.totalDsns;
                }
                if (this.nbDedicatedCluster) {
                    total += this.totalDedicatedClusters;
                }
                return total;
            },
            packages: function () {
                return this.planInfo.packages.filter((p) => this.selectedPackages.includes(p.key));
            },
            totalPackages: function () {
                return this.packages.reduce((acc, v) => acc + v.price, 0);
            },
            totalListPrice: function () {
                return this.totalUsage + this.totalAddons;
            },
            totalSalesPrice: function () {
                return Math.ceil(this.totalListPrice - this.totalListPrice * this.discount / 100);
            },
            scoping: function () {
                return JSON.stringify({
                    nbSearchRequests: this.nbSearchRequests,
                    nbRecords: this.nbRecords,
                    hasPremium: this.hasPremium,
                    enterprisePackage: this.enterprisePackage,
                    nbDsn: this.nbDsn,
                    nbDedicatedCluster: this.nbDedicatedCluster,
                    discount: this.discount,
                    selectedAddons: this.selectedAddons,
                    selectedPackages: this.selectedPackages,
                });
            }
        },
        methods: {
            resetScoping: function () {
                this.nbSearchRequests = 0;
                this.nbRecords = 0;
                this.hasPremium = false;
                this.enterprisePackage = false;
                this.nbDsn = 0;
                this.nbDedicatedCluster = 0;
                this.discount = 0;
                this.selectedAddons = [];
                this.selectedPackages = [];
            },
            onUpdateScoping: function (scopingString) {
                const scoping = JSON.parse(scopingString);
                this.nbSearchRequests = scoping.nbSearchRequests;
                this.nbRecords = scoping.nbRecords;
                this.hasPremium = scoping.hasPremium;
                this.enterprisePackage = scoping.enterprisePackage;
                this.nbDsn = scoping.nbDsn;
                this.nbDedicatedCluster = scoping.nbDedicatedCluster;
                this.discount = scoping.discount;
                this.selectedAddons = scoping.selectedAddons;
                this.selectedPackages = scoping.selectedPackages;
            },
            nbUnitBasedOnSearch: function (isCommitted) {
                return isCommitted ? Math.ceil(this.nbSearchRequests / 1000) : Math.ceil(this.nbSearchRequests / 1000 / 12);
            },
            nbUnitBasedOnRecords: function (isCommitted) {
                return isCommitted ? Math.ceil(this.nbRecords / 100)  : Math.ceil(this.nbRecords / 1000);
            },
            nbUnit: function (isCommitted) {
                return Math.max(this.nbUnitBasedOnRecords(isCommitted), this.nbUnitBasedOnSearch(isCommitted));
            },
            computeTranches: function (nbUnit) {
                let remainingUnit = nbUnit;
                let totalCost = 0;

                return this.planInfo.tranches.map((tranche) => {
                    const max = tranche.max ? tranche.max : Number.MAX_SAFE_INTEGER;
                    const min = Math.max(0, tranche.min - 1);
                    const neededUnitForTranche = Math.min(remainingUnit, max - min);
                    const unitCost = this.hasPremium ? tranche.premiumUnitCost : tranche.unitCost;
                    const trancheCost = Math.round(neededUnitForTranche * unitCost);

                    remainingUnit = remainingUnit - neededUnitForTranche;
                    totalCost = totalCost + trancheCost;

                    return {
                        ...tranche,
                        nbUnit: neededUnitForTranche,
                        unitCost: unitCost,
                        trancheCost: trancheCost,
                        totalCost: totalCost,
                    }
                });
            },
        }
    }
</script>
