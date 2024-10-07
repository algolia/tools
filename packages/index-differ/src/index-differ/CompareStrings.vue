<template>
    <div class="text-solstice-blue">
        <!-- XSS Check: assumes diff2html is xss safe -->
        <div v-html="htmlDiff"></div>
    </div>
</template>

<script>
    import {Diff2Html} from 'diff2html';
    import 'diff2html/dist/diff2html.css'
    import {createPatch} from "@/index-differ/differ";

    export default {
        name: 'CompareStrings',
        props: ['stringA', 'stringB', 'patch'],
        computed: {
            htmlDiff: function () {
                const patch = this.patch || createPatch(this.stringA, this.stringB);
                const outStr = Diff2Html.getJsonFromDiff(patch, {inputFormat: 'diff', outputFormat: 'side-by-side', showFiles: false, matching: 'lines'});
                const html = Diff2Html.getPrettyHtml(outStr, {inputFormat: 'json', outputFormat: 'side-by-side', showFiles: false, matching: 'lines'});

                return html;
            }
        },
    }
</script>

<style>
    .d2h-file-header{
        display: none
    }

    .d2h-file-side-diff {
        overflow-x: auto;
    }

    .d2h-diff-tbody tr:first-child {
        display: none;
    }

    .d2h-file-wrapper {
        border: none;
        margin-bottom: 0;
    }

    .d2h-code-side-linenumber {
        border: none;
    }

    .d2h-emptyplaceholder {
        background-color: white;
    }

    .d2h-code-line-prefix {
        display: none;
    }

    .d2h-files-diff {
        padding-top: 4px;
        padding-bottom: 4px;
    }

    .d2h-diff-table {
        color: #5d6494;
    }

    .d2h-code-side-linenumber {
        display: none;
    }

    .d2h-code-side-line {
        padding: 0;
    }
</style>
