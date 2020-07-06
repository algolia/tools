<template>
    <table>
        <div class="flex border-b border-proton-grey-opacity-40">
            <div class="p-8 pl-0 align-top w-148">Usage</div>
            <div class="p-8 align-top w-148">
                ${{numberWithCommas(totalUsage)}}/year
            </div>
            <div class="p-8">
                {{ nbUnitBasedOnSearch >= nbUnitBasedOnRecords ? 'Driven by search requests': 'Driven by records' }}
            </div>
        </div>
        <div class="flex border-b border-proton-grey-opacity-40">
            <div class="p-8 pl-0 align-top w-148">Addons</div>
            <div class="p-8 align-top w-148">
                ${{numberWithCommas(totalAddons)}}/year
            </div>
            <div class="p-8 align-top">
                <table>
                    <tr v-for="addon in addons">
                        <td>{{addon.name}}</td>
                        <td>${{numberWithCommas(addon.price)}}</td>
                    </tr>
                    <tr v-if="enterprisePackage">
                        <td>Enterprise package</td>
                        <td>${{numberWithCommas(enterprisePackagePrice)}}</td>
                    </tr>
                    <tr v-if="nbDsn > 0">
                        <td>{{nbDsn}} DSNs</td>
                        <td>${{totalDsns}}</td>
                    </tr>
                    <tr v-if="nbDedicatedCluster > 0">
                        <td>{{nbDedicatedCluster}} Dedicated clusters</td>
                        <td>${{numberWithCommas(totalDedicatedClusters)}}</td>
                    </tr>
                </table>
            </div>
        </div>
        <div class="flex">
            <div class="p-8 pl-0 align-top w-148">Total List Price</div>
            <div class="p-8 align-top">${{numberWithCommas(totalListPrice)}}/year</div>
        </div>
        <h3 class="mt-24 mb-8">Total</h3>
        <div class="flex border-b border-t border-proton-grey-opacity-40">
            <div class="p-8 pl-0 align-top w-148">Discount</div>
            <div class="p-8 align-top">
                <input type="number" v-model="currentDiscount" min="0" max="55">% (< 55%)
            </div>
        </div>
        <div class="flex border-b border-proton-grey-opacity-40">
            <div class="p-8 pl-0 align-top w-148">Total Sales Price</div>
            <div class="p-8 align-top">${{numberWithCommas(totalSalesPrice)}}/year</div>
        </div>
        <div class="flex">
            <div class="p-8 pl-0 align-top w-148">Total Expert Services</div>
            <div class="p-8 align-top">${{numberWithCommas(totalPackages)}}</div>
        </div>
    </table>
</template>

<script>
    import {numberWithCommas} from "common/utils/formatters";

    export default {
        name: 'Cost',
        props: [
            'nbUnitBasedOnSearch',
            'nbUnitBasedOnRecords',
            'totalUsage',
            'totalAddons',
            'addons',
            'enterprisePackage',
            'enterprisePackagePrice',
            'nbDsn',
            'totalDsns',
            'nbDedicatedCluster',
            'totalDedicatedClusters',
            'totalListPrice',
            'discount',
            'totalSalesPrice',
            'totalPackages',
        ],
        data: function () {
            return {
                numberWithCommas: numberWithCommas,
            }
        },
        computed: {
            currentDiscount: {
                get () {
                    return this.discount;
                },
                set (val) {
                    this.$emit('onUpdateDiscount', val);
                }
            },
        }
    }
</script>
