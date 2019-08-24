<template>
    <div class="flex p-8">
        <div
            class="mr-auto hover:text-nebula-blue hover:underline cursor-pointer"
            @click="$emit('onSelected')"
        >
            <div class="flex items-center">
                <div>query</div>
                <div class="ml-4 px-4 py-2 text-sm rounded leading-none bg-proton-grey-opacity-40">
                    {{ test.testData.when.query ? test.testData.when.query : '&lt;empty&gt;'}}
                </div>
                <div v-if="Object.keys(test.testData.when).length > 1" class="ml-4">
                    +{{Object.keys(test.testData.when).length - 1}} params
                </div>
            </div>
            <div v-if="test.testData.description" class="text-nova-grey">{{test.testData.description}}</div>
        </div>
        <div
            class="ml-auto"
            @click="test.run()"
            v-if="!confirmDelete"
        >
            Run
        </div>
        <div class="ml-16">
            <trash-icon
                v-if="!confirmDelete"
                class="w-12 h-12 block ml-8 cursor-pointer text-solstice-blue"
                @click="confirmDelete = true"
            />
            <div v-if="confirmDelete" class="flex">
                <button
                    @click="deleteTest(test, testPos)"
                    class="rounded bg-mars-1 shadow-sm hover:shadow transition-fast-out text-white p-8"
                >
                    Delete
                </button>
                <button
                    @click="confirmDelete = false"
                    class="ml-8 block bg-white rounded border border-proton-grey-opacity-40 shadow-sm hover:shadow transition-fast-out px-16 p-8 text-sm relative group">
                    Cancel
                </button>
            </div>
        </div>
    </div>
</template>

<script>
    import TrashIcon from 'common/icons/trash.svg';

    export default {
        name: 'EditTest',
        props: ['suite', 'test', 'testPos'],
        components: {TrashIcon},
        data: function () {
            return {
                confirmDelete: false,
            }
        },
        methods: {
            deleteTest: async function (test, testPos) {
                await fetch(`${process.env.VUE_APP_METAPARAMS_BACKEND_ENDPOINT}/relevance-testing/suites/${this.suite.id}/groups/${test.group.id}/tests/${test.id}`, {
                    method: 'DELETE',
                    credentials: 'include',
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                this.$delete(test.group.tests, testPos);
            },
        }
    }
</script>