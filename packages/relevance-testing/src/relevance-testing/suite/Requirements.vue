<template>
    <div>
        <div v-if="requirements.length > 0">
            <div class="flex">
                <div class="mx-auto border-l border-proton-grey h-12"></div>
            </div>
            <div class="flex">
                <div class="mx-auto bg-moon-grey-opacity-50 border border-proton-grey px-8 py-4 rounded text-xs uppercase tracking-wide text-solstice-blue">
                    where
                </div>
            </div>
            <div class="flex">
                <div class="mx-auto border-l border-proton-grey h-12"></div>
            </div>
        </div>
        <div>
            <div class="flex" v-for="(requirement, requirementPos) in requirements">
                <requirement
                    :requirement="requirement"
                    :requirement-pos="requirementPos"
                    :passing="reports ? reports[requirementPos].passing : null"
                    :run-index="runIndex"
                    :noBadge="noBadge"
                    class="mx-auto"
                    @onDelete="deleteRequirement(requirements, requirementPos)"
                />
            </div>
        </div>
        <div>
            <div class="flex">
                <div class="mx-auto border-l border-proton-grey h-12"></div>
            </div>
            <div class="flex">
                <button
                    class="mx-auto bg-white border border-b-0 border-proton-grey-opacity-40 rounded shadow-sm hover:shadow transition-fast-out px-16 p-8 text-sm"
                    @click="addRequirement(requirements)"
                >
                    Add requirement
                </button>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'Requirements',
        components: {
            Requirement: () => import('./Requirement.vue')
        },
        props: ['requirements', 'runIndex', 'reports', 'noBadge'],
        methods: {
            addRequirement: function (requirements) {
                requirements.push({
                    type: "attribute",
                    key: "objectID",
                    operator: "=",
                    value: ""
                });
            },
            deleteRequirement: function (requirements, i) {
                this.$delete(requirements, i);
            },
        }
    }
</script>