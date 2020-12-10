<template>
    <div>
        <div class="mt-32" v-if="originals.length > 0 || displayedAlternatives.length > 0">
            <div class="text-center text-sm uppercase tracking-wide">Considered Alternatives</div>
            <table class="border-collapse bg-white border border-proton-grey-opacity-50 text-center w-full mt-8">
                <tr>
                    <td
                        v-for="(original, i) in originals"
                        :colspan="original.length"
                        class="p-8 border border-proton-grey-opacity-50 bg-moon-grey-opacity-50 align-top"
                    >
                        <div>
                            <span v-if="original.words.length > 0">"</span>{{original.words.join(' ')}}<span v-if="original.words.length > 0">"</span>
                        </div>
                        <div class="text-nova-grey" v-for="type in original.types">
                            {{type}}
                        </div>
                    </td>
                </tr>
                <tr v-for="row in getRows">
                    <td
                        v-for="alternative in row"
                        :colspan="alternative.length"
                        class="p-8 border border-proton-grey-opacity-50 align-top"
                        :class="{'bg-moon-grey-opacity-50': alternative.types}"
                    >
                        <template v-if="alternative.types">
                            <div>
                                <span v-if="alternative.types.includes('synonym')">"</span>{{alternative.words.join(' ')}}<span v-if="alternative.types.includes('synonym')">"</span>
                            </div>
                            <div class="text-nova-grey" v-for="type in alternative.types">
                                {{type}}
                            </div>
                        </template>
                    </td>
                </tr>
            </table>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'AppliedAlternatives',
        props: ['algoliaResponse'],
        data: function () {
            return {
                // ignoreTypes: ['original', 'typo', 'conjugation']
                keepTypes: ['excluded', 'plural', 'split', 'concat', 'synonym', 'compound', 'altcorrection', 'conjugation'],
                originalTypes: ['original', 'stopword', 'optional'],
            }
        },
        computed: {
            alternatives: function () {
                if (this.algoliaResponse.explain && this.algoliaResponse.explain.match && this.algoliaResponse.explain.match.alternatives) {
                    return this.algoliaResponse.explain.match.alternatives;
                }
                return [];
            },
            displayedAlternatives: function () {
                return this.alternatives.filter((alternative) => {
                    for (let i = 0; i < alternative.types.length; i++) {
                        if (this.keepTypes.indexOf(alternative.types[i]) !== -1) {
                            return true;
                        }
                    }
                    return false;
                }).sort((a, b) => {return a.offset - b.offset}).sort((a, b) => {return a.length - b.length});
            },
            originals: function () {
                const originals = this.alternatives.filter((alternative) => {
                    for (let i = 0; i < alternative.types.length; i++) {
                        if (this.originalTypes.includes(alternative.types[i])) {
                            return true;
                        }
                    }
                    return false;
                }).sort((a, b) => a.offset - b.offset);

                let prevSeqExpr = -1;
                for (let i = 0; i < originals.length; i++) {
                    const currentSeqExpr = originals[i].seqExpr;
                    if (prevSeqExpr !== null && prevSeqExpr === currentSeqExpr) {
                        originals[i - 1].words.push(...originals[i].words)
                        originals[i - 1].length += originals[i - 1].length;
                        originals.splice(i, 1);
                        i--;
                    }
                    prevSeqExpr = currentSeqExpr;
                }

                return originals;
            },
            getRows: function () {
                const rows = [];
                const alternatives = JSON.parse(JSON.stringify(this.displayedAlternatives));
                const maxCols = this.originals.length;

                while (alternatives.length > 0) {
                    let currentRow = [];
                    let currentCol = 0;
                    for (let i = 0; i < alternatives.length; i++) {
                        if (alternatives[i].offset >= currentCol) {
                            const alt = alternatives.splice(i, 1)[0];

                            for (let j = currentCol; j < alt.offset; j++) {
                                currentRow.push({offset: j, length: 1});
                            }

                            currentCol = alt.offset + alt.length;
                            currentRow.push(alt);
                            i = i - 1;
                        }
                        if (currentCol >= maxCols) {
                            break;
                        }
                    }
                    const lastElement = currentRow[currentRow.length - 1];
                    for (let j = (lastElement.offset + lastElement.length); j < maxCols; j++) {
                        currentRow.push({offset: j, length: 1});
                    }
                    rows.push(currentRow);
                }

                return rows;
            }
        }
    }
</script>
