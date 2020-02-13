<template>
    <div>
        <div
            class="cursor-pointer diff-line"
            @click="collapsed = !collapsed"
        >
            <div
                class="py-4 pt-8 px-16"
                :class="{
                    'd2h-del': diff.removed,
                    'd2h-mod': diff.modified,
                    'd2h-ins': diff.added,
                }"
            >
                <div>
                    {{diff.value}}
                    <span v-if="diff.value.startsWith('http')">
                        <a @click.stop target="_blank" :href="diff.value" class="text-nebula-blue">
                            <external-link class="w-12 h-12 -mt-2" />
                        </a>
                    </span>
                </div>
            </div>
        </div>
        <div v-if="!collapsed">
            <compare-strings
                class="nested-compare"
                :string-a="diff.stringA"
                :string-b="diff.stringB"
            />
        </div>
    </div>
</template>

<script>
    import CompareStrings from "@/index-differ/CompareStrings";
    import ExternalLink from "common/icons/external-link.svg";

    export default {
        name: 'RecordDiff',
        components: {CompareStrings, ExternalLink},
        props: ['diff'],
        data: function () {
            return {
                collapsed: true,
            }
        },
        created: function () {
            this.$root.$on('onForceCollapseAll', () => {
                this.collapsed = true;
            });
            this.$root.$on('onForceExpandAll', () => {
                this.collapsed = false;
            });
        }
    }
</script>

<style>
    .d2h-mod {
        background-color: rgba(255, 176, 58, 0.25);
    }

    .nested-compare .d2h-code-side-linenumber, .nested-compare .d2h-emptyplaceholder {
        background-color: inherit;
    }

    .d2h-files-diff {
        padding: 0;
        display: flex;
    }

    .d2h-file-side-diff {
        display: block;
        margin: 0;
    }

    .diff-line:hover .d2h-mod {
        background-color: rgba(255, 176, 58, 0.50);
    }

    .diff-line:hover .d2h-del {
        background-color: #fea6a5;
    }

    .diff-line:hover .d2h-ins {
        background-color: #a0ffb3;
    }
</style>
