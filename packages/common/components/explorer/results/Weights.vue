<template>
    <div class="mt-32">
        <div class="text-center text-sm uppercase tracking-wide">Configure Cosine Similarity Weights</div>
            <table>
                <tr>
                    <td>typo</td>
                    <td><input type="number" v-model="weights.typo" min="0" max="10" class="input-custom ml-8"></td>
                </tr>
                <tr>
                    <td>attribute</td>
                    <td><input type="number" v-model="weights.attribute" min="0" max="10" class="input-custom ml-8"></td>
                </tr>
                <tr>
                    <td>words</td>
                    <td><input type="number" v-model="weights.words" min="0"  max="10" class="input-custom ml-8"></td>
                </tr>
                <tr>
                    <td>proximity</td>
                    <td><input type="number" v-model="weights.proximity"  min="0" max="10" class="input-custom ml-8"></td>
                </tr>
                <tr>
                    <td>exact</td>
                    <td><input type="number" v-model="weights.exact" min="0" max="10" class="input-custom ml-8"></td>
                </tr>
                <tr>
                    <td>filters</td>
                    <td><input type="number" v-model="weights.filters"  min="0" max="10" class="input-custom ml-8"></td>
                </tr>
                <tr>
                    <td>geo</td>
                    <td><input type="number" v-model="weights.geo"  min="0" max="10" class="input-custom ml-8"></td>
                </tr>
            </table>
        </div>
</template>

<script>
    import panelsMixin from "../../../mixins/panelsMixin";

    export default {
        name: 'weights',
        props: ['panelKey'],
        mixins: [panelsMixin],
        data: function () {
            return {
                weights: {
                    typo: 10,
                    attribute: 10,
                    words: 9,
                    proximity: 2,
                    exact: 2,
                    filters: 1,
                    geo: 1
                }
            }
        },
        watch: {
            weights: {
                deep: true,
                handler: function () {
                    this.$root.$emit(`${this.panelKey}OnUpdateWeights`, JSON.parse(JSON.stringify(this.weights)));
                    this.$root.$emit('shouldTriggerSearch', this.panelIndexName);
                }
            }
        },
    }
</script>
