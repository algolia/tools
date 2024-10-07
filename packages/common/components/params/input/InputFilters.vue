<template>
    <div class="relative h-100 w-256">
        <!-- XSS Check: the tokens are handled through `escapeHtml` -->
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
    import {escapeHtml} from "common/utils/formatters";

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
                if (!this.value) return '';
                const response = this.parser.parse(this.value);
                const content = response.tokens.map(function(token) {
                    return `<span class="${token.cssClasses.join(' ')}">${
                        escapeHtml(token.raw_value)
                    }</span><span class="${token.afterSeparatorsCssClasses.join(' ')}">${
                        escapeHtml(token.afterSeparators)
                    }</span>`;
                }).join('');

                return content;
            }
        },
    }
</script>
