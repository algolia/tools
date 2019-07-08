<template>
    <div class="mt-32" v-if="originals.length > 0 || displayedAlternatives.length > 0">
        <div class="text-center text-sm uppercase tracking-wide">Considered Alternatives</div>
        <table class="border-collapse bg-white border border-proton-grey-opacity-50 text-center w-full mt-8">
            <tr>
                <td
                    v-for="original in originals"
                    class="p-8 border border-proton-grey-opacity-50 bg-moon-grey-opacity-50"
                >
                    {{original.words[0]}}
                    <div class="text-nova-grey">{{original.type}}</div>
                </td>
            </tr>
            <tr v-for="row in getRows">
                <td
                    v-for="alternative in row"
                    :colspan="alternative.length"
                    class="p-8 border border-proton-grey-opacity-50"
                    :class="{'bg-moon-grey-opacity-50': alternative.type}"
                >
                    <template v-if="alternative.type">
                        <div>{{alternative.words.join(' ')}}</div>
                        <div class="text-nova-grey">{{alternative.type}}</div>
                    </template>
                </td>
            </tr>
        </table>
    </div>
</template>

<script>
    export default {
        name: 'AppliedAlternatives',
        props: ['algoliaResponse'],
        data: function () {
            return {
                // ignoreTypes: ['original', 'typo', 'conjugation']
                keepTypes: ['excluded', 'plural', 'split', 'concat', 'synonym'],
                originalTypes: ['original', 'stopword'],
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
                    return this.keepTypes.indexOf(alternative.type) !== -1;
                }).sort((a, b) => {return a.offset - b.offset}).sort((a, b) => {return a.length - b.length});
            },
            originals: function () {
                return this.alternatives.filter((alternative) => {
                    return this.originalTypes.indexOf(alternative.type) !== -1;
                })
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