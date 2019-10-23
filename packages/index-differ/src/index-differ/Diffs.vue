<template>
    <div class="pb-16">
        <div v-if="currentTab !== 'settings'">
            <objects-diff v-if="differ && differ.diffs.records" :differ="differ" :resource-name="currentTab" />
        </div>
        <div v-if="currentTab === 'settings'">
            <compare-strings
                class="py-16"
                v-if="differ && Object.keys(differ.A.settings).length > 0 && Object.keys(differ.B.settings).length > 0"
                :string-a="JSON.stringify(differ.A.settings, null, 2)"
                :string-b="JSON.stringify(differ.B.settings, null, 2)"
            />
        </div>
    </div>
</template>

<script>
    import CompareStrings from "@/index-differ/CompareStrings";
    import ObjectsDiff from "@/index-differ/ObjectsDiff";

    export default {
        name: 'Diffs',
        components: {ObjectsDiff, CompareStrings},
        props: ['differ', 'currentTab'],
    }
</script>
