<template>
  <div class="text-solstice-blue">
    <!-- XSS Check: assumes diff2html is XSS safe -->
    <div v-html="htmlDiff" />
  </div>
</template>

  <script>
  import { parse, html } from 'diff2html';
  import 'diff2html/bundles/css/diff2html.min.css';
  import { createPatch } from '@/index-differ/differ';

  export default {
    name: 'CompareStrings',
    props: ['stringA', 'stringB', 'patch'],
    computed: {
      htmlDiff() {
        const patch = this.patch || createPatch(this.stringA, this.stringB);
        const diffJson = parse(patch, { inputFormat: 'diff' });
        const diffHtml = html(diffJson, {
          outputFormat: 'side-by-side',
          showFiles: false,
          matching: 'lines',
        });

        return diffHtml;
      },
    },
  };
  </script>

<style>
.d2h-file-header {
    display: none;
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
