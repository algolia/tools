<template>
  <div
    v-if="rules.length"
    class="flex flex-wrap items-center"
    style="gap: 8px;"
  >
    <span class="text-telluric-blue text-lg font-bold mr-4">
      Applied composition rules ({{ rules.length }}):
    </span>
    <span
      v-for="rule in rules"
      :key="rule"
      class="bg-white border border-saturn-2 text-telluric-blue text-base rounded px-12 py-4"
    >
      {{ rule }}
    </span>
  </div>
</template>

<script>
    export default {
        name: 'AppliedRules',
        props: {
            rules: {
                type: Array,
                required: true,
            },
        },
    };
</script>
