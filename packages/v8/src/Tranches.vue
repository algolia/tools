<template>
    <div>
        <div class="my-24">
            Units Required:
            <span v-if="isCommitted">{{nbUnit}} ({{formatHumanNumber(nbUnit * 1000, 2)}} search, {{formatHumanNumber(nbUnit * 100, 2)}} records)</span>
            <span v-if="!isCommitted">{{nbUnit}} * 12 = {{nbUnit * 12}} ({{formatHumanNumber(nbUnit * 12 * 1000, 2)}} search, {{formatHumanNumber(nbUnit * 1000, 2)}} records)</span>
        </div>
        <table>
            <tr class="border-b border-proton-grey-opacity-40">
                <td class="uppercase tracking-wide text-xs p-8">Tranches</td>
                <td class="uppercase tracking-wide text-xs p-8">Nb Unit</td>
                <td class="uppercase tracking-wide text-xs p-8">Unit Cost</td>
                <td class="uppercase tracking-wide text-xs p-8">Total Cost</td>
            </tr>
            <tr v-for="tranche in unitsPerTranche" class="border-b border-proton-grey-opacity-40">
                <td class="p-8" v-if="tranche.max">{{tranche.min}} - {{tranche.max}}</td>
                <td class="p-8" v-else="tranche.max">{{tranche.min}}+</td>
                <td class="p-8">{{tranche.nbUnit}}</td>
                <td class="p-8">${{tranche.unitCost}}</td>
                <td class="p-8">${{numberWithCommas(tranche.trancheCost)}}</td>
            </tr>
            <tr>
                <td class="p-8" colspan="3">Total</td>
                <td v-if="isCommitted" class="p-8">
                    ${{numberWithCommas(unitsPerTranche[unitsPerTranche.length - 1].totalCost)}}/year
                    (${{numberWithCommas(Math.ceil(unitsPerTranche[unitsPerTranche.length - 1].totalCost / 12))}}/month)
                </td>
                <td v-if="!isCommitted" class="p-8">
                    ${{numberWithCommas(unitsPerTranche[unitsPerTranche.length - 1].totalCost * 12)}}/year
                    (${{numberWithCommas(unitsPerTranche[unitsPerTranche.length - 1].totalCost)}}/month)
                </td>
            </tr>
        </table>
    </div>
</template>

<script>
    import {numberWithCommas, formatHumanNumber} from "common/utils/formatters";

    export default {
        name: 'Tranches',
        props: ['unitsPerTranche', 'isCommitted', 'nbUnit'],
        data: function () {
            return {
                numberWithCommas: numberWithCommas,
                formatHumanNumber: formatHumanNumber,
            }
        },
    }
</script>
