<template>
    <div class="p-8">
        <div
            class="cursor-pointer text-sm"
            @click="$emit('onSelected')"
        >
            <div>
                <div v-if="!isActive">
                    <div class="flex items-center flex-wrap">
                        <div class="px-4 py-2 rounded leading-none bg-proton-grey-opacity-40 mr-4 mb-4">
                            {{ query ? query : '&lt;empty&gt;' }}
                        </div>
                        <div v-if="Object.keys(when).length > 0" class="mb-4 px-4 py-2 rounded leading-none bg-proton-grey-opacity-40">
                            <div v-for="(value, key) in params">
                                {{JSON.stringify(key)}}: {{JSON.stringify(value)}}
                            </div>
                        </div>
                    </div>
                    <div v-if="description" class="text-nova-grey ml-4">
                        {{description}}
                    </div>
                </div>
                <div v-else>
                    <table class="w-full">
                        <tr>
                            <td class="w-112 align-top">
                                Query to test:
                            </td>
                            <td class="pl-12">
                                <input
                                    class="w-full block py-2 bg-white text-black leading-normal input-custom"
                                    placeholder="query to test"
                                    v-model="query"
                                >
                            </td>
                        </tr>
                        <tr>
                            <td class="w-112 pt-12 align-top">Test description:</td>
                            <td class="pt-12 pl-12">
                                <textarea
                                    v-model="description"
                                    class="py-8 px-8 w-full rounded input-custom"
                                ></textarea>
                            </td>
                        </tr>
                        <tr>
                            <td class="w-112 pt-12 align-top">With search params:</td>
                            <td class="pt-12 pl-12">
                                <params
                                    id="when"
                                    config-key="searchParams"
                                    :params="when"
                                    :ref-params="when"
                                    :raw-params="when"
                                    :keys="Object.keys(when)"
                                    :keys-indexer="null"
                                    :mutate="true"
                                />
                            </td>
                        </tr>
                        <tr>
                            <td class="w-112 pt-12"></td>
                            <td class="pt-12 pl-12">
                                <div class="mt-40">
                                    <div class="flex">
                                        <button
                                            v-if="!confirmDelete"
                                            @click="confirmDelete = true"
                                            class="flex item-center bg-white rounded border border-b-0 border-proton-grey-opacity-40 shadow-sm hover:shadow transition-fast-out px-16 p-8"
                                        >
                                            <trash-icon class="w-12 h-12 block cursor-pointer mr-4 -mt-1" />
                                            <div>
                                                Delete test
                                            </div>
                                        </button>
                                    </div>
                                    <div v-if="confirmDelete" class="flex">
                                        <button
                                            @click="confirmDelete = false"
                                            class="block bg-white rounded border border-proton-grey-opacity-40 shadow-sm hover:shadow transition-fast-out px-16 p-8 text-sm relative group">
                                            Cancel
                                        </button>
                                        <button
                                            @click="deleteTest(test, testPos)"
                                            class="ml-8 rounded bg-mars-1 shadow-sm hover:shadow transition-fast-out text-white p-8"
                                        >
                                            Confirm Delete
                                        </button>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import TrashIcon from 'common/icons/trash.svg';
    import Params from 'common/components/params/Params';
    import {algoliaParams} from "common/utils/algoliaHelpers";

    export default {
        name: 'EditTest',
        props: ['suite', 'test', 'testPos', 'isActive'],
        components: {TrashIcon, Params},
        data: function () {
            return {
                confirmDelete: false,
                when: null,
                query: null,
                canSave: false,
            }
        },
        created: function () {
            this.loadTest();
            this.$nextTick(() => {
                this.canSave = true;
            });
        },
        watch: {
            test: function () {
                this.canSave = false;
                this.loadTest();
                this.$nextTick(() => {
                    this.canSave = true;
                });
            },
            query: function () { this.saveTest(); },
            when: {
                deep: true,
                handler: function () { this.saveTest(); }
            },
        },
        computed: {
            params: function () {
                return algoliaParams(this.when);
            },
            description: {
                get () {
                    return this.test.testData.description;
                },
                set (value) {
                    this.test.testData.description = value;
                    this.saveTest();
                }
            }
        },
        methods: {
            loadTest: function () {
                const searchParams = {};
                Object.keys(this.test.testData.when).forEach((key) => {
                    if (key === 'query') {
                        this.query = this.test.testData.when[key];
                    }
                    else {
                        searchParams[key] = {value: this.test.testData.when[key], enabled: true};
                    }
                });
                this.when = searchParams;
            },
            saveTest: async function () {
                if (!this.canSave) return;

                this.test.updateTestData({
                    ...this.test.testData,
                    when: {
                        ...algoliaParams(this.when),
                        query: this.query,
                    },
                });

                await fetch(`${process.env.VUE_APP_METAPARAMS_BACKEND_ENDPOINT}/relevance-testing/suites/${this.suite.id}/groups/${this.test.group.id}/tests/${this.test.id}`, {
                    method: 'PUT',
                    credentials: 'include',
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        test_data: JSON.stringify(this.test.testData),
                    }),
                });

                this.test.run(true);
            },
            deleteTest: async function (test, testPos) {
                await fetch(`${process.env.VUE_APP_METAPARAMS_BACKEND_ENDPOINT}/relevance-testing/suites/${this.suite.id}/groups/${test.group.id}/tests/${test.id}`, {
                    method: 'DELETE',
                    credentials: 'include',
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                this.$emit('onDeleted');
                this.$delete(test.group.tests, testPos);
            },
        }
    }
</script>