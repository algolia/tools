<template>
    <div class="flex p-8 text-telluric-blue text-xs uppercase tracking-wide">
        <div>
            <div class="mr-auto" v-if="!confirmEdit">
                {{group.name}}
            </div>
            <div>
                <input
                    v-if="confirmEdit"
                    class="input-custom mr-auto"
                    v-model="name"
                    @keyup.enter="updateGroup"
                />
            </div>
        </div>
        <div class="ml-auto">
            <div
                v-if="!confirmEdit && !confirmDelete"
                class="flex"
            >
                <div @click.stop="group.run()">
                    Run
                </div>
                <div @click.stop="confirmEdit = true">
                    <edit-icon class="w-12 h-12 block ml-8 cursor-pointer text-solstice-blue" />
                </div>
                <div @click.stop="confirmDelete = true">
                    <trash-icon class="w-12 h-12 block ml-8 cursor-pointer text-solstice-blue" />
                </div>
            </div>
            <div class="flex" v-if="confirmEdit || confirmDelete">
                <button
                    v-if="confirmEdit"
                    @click.stop="updateGroup"
                    class="ml-auto block bg-white rounded border border-saturn-2 text-saturn-1 shadow-sm hover:shadow transition-fast-out px-16 p-8 text-sm relative group"
                >
                    {{ 'Save' }}
                </button>
                <button
                    v-if="confirmDelete"
                    @click.stop="deleteGroup"
                    class="rounded bg-mars-1 shadow-sm hover:shadow transition-fast-out text-white p-8"
                >
                    Delete
                </button>
                <button
                    @click.stop="confirmDelete = false; confirmEdit = false"
                    class="ml-8 block bg-white rounded border border-proton-grey-opacity-40 shadow-sm hover:shadow transition-fast-out px-16 p-8 text-sm relative group">
                    Cancel
                </button>
            </div>
        </div>
    </div>
</template>

<script>
    import TrashIcon from 'common/icons/trash.svg';
    import EditIcon from 'common/icons/edit.svg';

    export default {
        name: 'EditGroup',
        props: ['group', 'groupPos', 'suite'],
        components: {TrashIcon, EditIcon},
        data: function () {
            return {
                name: this.group.name,
                confirmDelete: false,
                confirmEdit: false,

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
                this.confirmEdit = false;
            },
            deleteGroup: async function () {
                await fetch(`${process.env.VUE_APP_METAPARAMS_BACKEND_ENDPOINT}/relevance-testing/suites/${this.suite.id}/groups/${this.group.id}`, {
                    method: 'DELETE',
                    credentials: 'include',
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                this.$delete(this.suite.groups, this.groupPos);
            },
        }
    }
</script>