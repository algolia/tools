<template>
    <div class="my-8 p-8 bg-white rounded border border-white">
        <div class="flex" v-if='!editMode'>
            <div class="w-third">
                <router-link :to="`/suites/${suite.id}`" class="block text-nebula-blue hover:underline cursor-pointer">
                    {{suite.name}}
                </router-link>
            </div>
            <div class="w-third" v-if="!readOnly">
                <div v-if="testSuite.permissions && testSuite.permissions.length > 0">
                    <div v-for="permission in testSuite.permissions">
                        {{permission.email}}
                    </div>
                </div>
                <div v-else class="text-nova-grey">
                    No collaborators
                </div>
            </div>
            <div class="w-third text-right" v-if="!readOnly">
                <div v-if="!confirmDelete">
                    <edit-icon
                        @click="editMode = true"
                        class="ml-4 w-12 h-12 text-nova-grey-opacity-80 hover:text-telluric-blue cursor-pointer"
                    />
                    <trash-icon
                        @click="confirmDelete = true"
                        class="ml-4 w-12 h-12 text-nova-grey-opacity-80 hover:text-telluric-blue cursor-pointer"
                    />
                </div>
                <div v-if="confirmDelete">
                    <div class="flex items-start">
                        <input
                            v-model="confirmDeleteText"
                            placeholder="To delete type the test suite name"
                            class="ml-auto block input-custom p-4 w-full"
                        >
                    </div>
                    <div class="flex items-start mt-16">
                        <div class="ml-auto"></div>
                        <button
                            v-if="confirmDeleteText.toLowerCase() === testSuite.name.toLowerCase()"
                            @click="deleteTestSuite"
                            class="rounded bg-mars-1 shadow-sm hover:shadow transition-fast-out text-white p-8"
                        >
                            Delete test Suite
                        </button>
                        <button
                            @click="confirmDelete = false"
                            class="ml-8 block bg-white rounded border border-proton-grey-opacity-40 shadow-sm hover:shadow transition-fast-out px-16 p-8 text-sm relative group">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div class="flex" v-if="editMode">
            <div class="w-third pr-16">
                <input
                    v-model="testSuite.name"
                    ref="nameInput"
                    placeholder="Test suite name"
                    @keyup.enter="createOrUpdate"
                    class="w-full bg-proton-grey-opacity-20 p-4"
                >
            </div>
            <div class="w-third">
                <div v-for="(permission, i) in testSuite.permissions" class="mb-8 flex items-center">
                    <input
                        v-model="permission.email"
                        @keyup.enter="testSuite.permissions.push({email: ''})"
                        placeholder="Email to invite"
                        class="flex-grow bg-proton-grey-opacity-20 p-4"
                    >
                    <button
                        @click="$delete(testSuite.permissions, i)"
                        class="bg-white rounded border border-proton-grey-opacity-40 shadow-sm hover:shadow transition-fast-out ml-8 px-8 p-4 text-sm -mt-1"
                    >
                        -
                    </button>
                </div>
                <div>
                    <button
                        @click="testSuite.permissions.push({email: ''})"
                        class="bg-white rounded border border-proton-grey-opacity-40 shadow-sm hover:shadow transition-fast-out px-8 p-4 text-sm"
                        :class="{'mt-4': testSuite.permissions.length > 0}"
                    >
                        +
                    </button>
                </div>
            </div>
            <div class="w-third flex">
                <div v-if="isValid" class="ml-auto flex items-start">
                    <button
                        @click="createOrUpdate"
                        class="block bg-white rounded border border-proton-grey-opacity-40 shadow-sm hover:shadow transition-fast-out px-16 p-8 text-sm relative group"
                        :class="{'border-saturn-2 text-saturn-1': !testSuite.newSuite}"
                    >
                        {{ 'Save' }}
                    </button>
                    <button
                        @click="editMode = false"
                        class="ml-8 block bg-white rounded border border-proton-grey-opacity-40 shadow-sm hover:shadow transition-fast-out px-16 p-8 text-sm relative group">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import EditIcon from 'common/icons/edit.svg';
    import TrashIcon from 'common/icons/trash.svg';

    export default {
        name: 'SmallSuite',
        props: ['suite', 'readOnly'],
        components: {EditIcon, TrashIcon},
        data: function () {
            const testSuite = this.suite.name ? JSON.parse(JSON.stringify(this.suite)) : {newSuite: true, name: '', description: '', permissions: []};
            const editMode = !this.suite.name;

            if (editMode) {
                this.$nextTick(() => {
                     this.$refs.nameInput.focus();
                });
            }

            return {
                testSuite,
                editMode,
                confirmDelete: false,
                confirmDeleteText: '',
            }
        },
        computed: {
            isValid: function () {
                return this.testSuite.name.length > 0;
            }
        },
        methods: {
            createOrUpdate: async function () {
                this.testSuite.permissions = this.testSuite.permissions.filter((permission) => {
                    return permission.email.length > 0;
                });

                const method = this.testSuite.newSuite ? 'POST' : 'PUT';
                const url = this.testSuite.newSuite ? `${process.env.VUE_APP_METAPARAMS_BACKEND_ENDPOINT}/relevance-testing/suites` : `${process.env.VUE_APP_METAPARAMS_BACKEND_ENDPOINT}/relevance-testing/suites/${this.testSuite.id}`;
                await fetch(url, {
                    method,
                    credentials: 'include',
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(this.testSuite),
                });

                this.editMode = false;
                this.$emit('shouldUpdate');
            },
            deleteTestSuite: async function () {
                if (this.testSuite.id) {
                    await fetch(`${process.env.VUE_APP_METAPARAMS_BACKEND_ENDPOINT}/relevance-testing/suites/${this.testSuite.id}`, {
                        method: 'DELETE',
                        credentials: 'include',
                        headers: {
                            "Content-Type": "application/json",
                        },
                    });
                }

                this.$emit('shouldUpdate');
            }
        }
    }
</script>