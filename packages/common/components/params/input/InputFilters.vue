<template>
    <div class="relative h-100 w-256">
        <pre v-html="parsedValue"
             ref="pre"
             class="filter overflow-y-auto whitespace-pre-wrap absolute top-0 block w-full h-full bg-white text-telluric-blue resize-none shadow-none outline-none p-0 border-none font-mono text-base"
        ></pre>
        <textarea
                ref="input"
                v-model="value"
                v-on:keydown.enter.exact.prevent
                v-on:keyup.enter.prevent.exact="nextInput"
                v-on:keydown.tab.prevent="nextInput"
                @scroll="$refs.pre.scrollTop = $refs.input.scrollTop"
                @blur="inputState.setInput('none')"
                spellcheck="false"
                class="input absolute top-0 block w-full h-full bg-transparent text-transparent caret-color-cosmos-black resize-none shadow-none outline-none p-0 border-none font-mono text-base"
        />
    </div>
</template>

<script>
    import Parser from 'algolia-filters-js-syntax-validator';
    import inputMixin from "../scripts/inputMixin";

    export default {
        name: 'InputFilters',
        mixins: [inputMixin],
        data: function () {
            return {
                parser: new Parser(),
            }
        },
        computed: {
            parsedValue: function () {
                return this.parser.parse(this.value).html;
            }
        },
    }
</script>