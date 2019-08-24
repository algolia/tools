<template>
    <div class="flex">
        <input
            class="input-custom mr-16"
            v-model="name"
            @keyup.enter="updateGroup"
        />
        <button
            @click="updateGroup"
            class="ml-auto block bg-white rounded border border-saturn-2 text-saturn-1 shadow-sm hover:shadow transition-fast-out px-16 p-8 text-sm relative group"
        >
            {{ 'Save' }}
        </button>
        <button
            @click="$emit('stopEdit')"
            class="ml-8 block bg-white rounded border border-proton-grey-opacity-40 shadow-sm hover:shadow transition-fast-out px-16 p-8 text-sm relative group">
            Cancel
        </button>
    </div>
</template>

<script>
    export default {
        name: 'EditGroup',
        props: ['group'],
        data: function () {
            return {
                name: this.group.name,
            };
        },
        methods: {
            updateGroup: async function () {
                await fetch(`${process.env.VUE_APP_METAPARAMS_BACKEND_ENDPOINT}/relevance-testing/suites/${this.group.suite.id}/groups/${this.group.id}`, {
                    method: 'PUT',
                    credentials: 'include',
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name: this.name,
                    }),
                });

                this.group.name = this.name;
                this.$emit('stopEdit');
            },
        }
    }
</script>