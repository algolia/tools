<template>
    <div
        :class="{
            'd2h-del': diff.removed,
            'd2h-mod': diff.modified,
            'd2h-ins': diff.added
        }"
    >
        <div
            class="flex cursor-pointer"
            @click="collapsed = !collapsed"
        >
            <div
                class="w-half flex py-4"
            >
                <div class="w-52 truncate text-right" style="color: rgba(0, 0, 0, 0.3)">
                    <span v-if="!diff.added">{{diff.lineNumberA}}</span>
                </div>
                <div v-if="!diff.added" class="ml-8">
                    <div>{{diff.value}}</div>
                </div>
            </div>
            <div
                class="w-half flex py-4"
            >
                <div class="w-52 truncate text-right" style="color: rgba(0, 0, 0, 0.3)">
                    <span v-if="!diff.removed">{{diff.lineNumberB}}</span>
                </div>
                <div class="ml-8" v-if="!diff.removed">
                    <div>{{diff.value}}</div>
                </div>
            </div>
        </div>
        <div v-if="!collapsed" class="p-1">
            <div class="bg-moon-grey mx-16 mb-16">
                <div class="flex justify-center">
                    <div class="text-sm uppercase tracking-wide pt-16">Record Comparison</div>
                </div>
                <compare-strings
                    class="nested-compare p-16"
                    :patch="diff.patch"
                />
            </div>
        </div>
    </div>
</template>

<script>
    import CompareStrings from "@/index-differ/CompareStrings";
    export default {
        name: 'RecordDiff',
        components: {CompareStrings},
        props: ['diff'],
        data: function () {
            return {
                collapsed: true,
            }
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
</style>