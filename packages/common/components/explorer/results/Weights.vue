<template>
    <div class="mt-32">
        <div class="text-center text-sm uppercase tracking-wide">Configure Cosine Similarity Weights</div>
            <div class="border-b border-dotted border-telluric-blue-opacity-60 ml-12">
                Weight-typo: <input type="number" v-model="value.typo" min="0" max="10" style="width: 25px;"/>
                Weight-attributes: <input type="number" v-model="value.attributes" min="0" max="10" style="width: 25px;"/>
                Weight-words: <input type="number" v-model="value.words" min="0"  max="10" style="width: 25px;"/>
                Weight-proximity: <input type="number" v-model="value.proximity"  min="0" max="10" style="width: 25px;"/>
                Weight-exact: <input type="number" v-model="value.exact" min="0" max="10" style="width: 25px;"/>
                Weight-filters: <input type="number" v-model="value.filters"  min="0" max="10" style="width: 25px;"/>
                Weight-geo: <input type="number" v-model="value.geo"  min="0" max="10" style="width: 25px;"/>
            </div>
        </div>
</template>

<script>
    export default {
        name: 'weights',
        props: ['value']
    }
</script>
