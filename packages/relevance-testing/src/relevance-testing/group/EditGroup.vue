<template>
    <div class="flex p-8 text-telluric-blue cursor-pointer">
        <div>
            <div class="mr-auto text-xs uppercase tracking-wide" v-if="!confirmEdit">
                <chevron-left-icon
                    class="w-12 h-12 cursor-pointer text-solstice-blue"
                    :class="!collapsed ? 'rotate-270' : 'rotate-180'"
                />
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
                <div @click.stop="addTest" class="relative group">
                    <plus-icon class="w-12 h-12 block ml-8 cursor-pointer text-solstice-blue" />
                    <tooltip>Add test</tooltip>
                </div>
                <div @click.stop="confirmEdit = true" class="relative group">
                    <edit-icon class="w-12 h-12 block ml-8 cursor-pointer text-solstice-blue" />
                    <tooltip>Edit group name</tooltip>
                </div>
                <div @click.stop="confirmDelete = true" class="relative group">
                    <trash-icon class="w-12 h-12 block ml-8 cursor-pointer text-solstice-blue" />
                    <tooltip>Delete group. Will ask for confirmation</tooltip>
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
    import PlusIcon from 'common/icons/plus-circle.svg';
    import ChevronLeftIcon from 'common/icons/chevron-left.svg';
    import Tooltip from "common/components/Tooltip";
    import {Test} from "@/test-engine/engine";
    import {goToAnchor} from "common/utils/domHelpers";

    export default {
        name: 'EditGroup',
        props: ['group', 'groupPos', 'suite', 'collapsed'],
        components: {TrashIcon, EditIcon, PlusIcon, ChevronLeftIcon, Tooltip},
        data: function () {
            return {
                name: this.group.name,
                confirmDelete: false,
                confirmEdit: false,
            };
        },
        methods: {
            updateGroup: async function () {
                const endpoint = process.env.VUE_APP_METAPARAMS_BACKEND_ENDPOINT || 'https://tools-backend.algolia.com';

                await fetch(`${endpoint}/relevance-testing/suites/${this.group.suite.id}/groups/${this.group.id}`, {
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
                const endpoint = process.env.VUE_APP_METAPARAMS_BACKEND_ENDPOINT || 'https://tools-backend.algolia.com';
                await fetch(`${endpoint}/relevance-testing/suites/${this.suite.id}/groups/${this.group.id}`, {
                    method: 'DELETE',
                    credentials: 'include',
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                this.$delete(this.suite.groups, this.groupPos);
            },
            addTest: async function () {
                const endpoint = process.env.VUE_APP_METAPARAMS_BACKEND_ENDPOINT || 'https://tools-backend.algolia.com';
                const res = await fetch(`${endpoint}/relevance-testing/suites/${this.suite.id}/groups/${this.group.id}/tests`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        test_data: JSON.stringify({
                            name: `test ${this.group.tests.length + 1}`,
                            when: {query: ""},
                            then: [
                                {
                                    test: "contains",
                                    operator: ">=",
                                    value: 1,
                                    recordsMatching: [
                                        {
                                            "type": "attribute",
                                            "key": "objectID",
                                            "operator": "is",
                                            "value": ""
                                        }
                                    ]
                                }
                            ]
                        }),
                    }),
                });

                const testData = await res.json();
                const test = new Test(testData, this.suite.runs, this.group);
                this.group.tests.push(test);
                test.run();
                this.$nextTick(() => {
                    this.$emit('onTestCreated', test);
                    window.setTimeout(() => {
                        goToAnchor(`#test-${test.id}`);
                    }, 200);
                })
            },
        }
    }
</script>
