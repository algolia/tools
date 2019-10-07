<template>
    <tbody>
        <tr><td colspan="0" class="h-2 bg-moon-grey"></td></tr>
        <tr>
            <td @click="collapse = !collapse" class="w-500 min-w-500">
                <edit-group
                    class="bg-proton-grey-opacity-40 ml-24"
                    :group="group"
                    :group-pos="groupPos"
                    :suite="suite"
                    :collapsed="collapse"
                    @onTestCreated="$emit('onTestSelected', $event)"
                />
            </td>
            <template>
                <template v-for="(run, runPos) in runs">
                    <td class="w-2 bg-moon-grey"></td>
                    <td :key="run.id" class="bg-proton-grey-opacity-40">
                        <group-status :group="group" :run-pos="runPos" />
                    </td>
                </template>
            </template>
        </tr>
        <template v-if="!collapse">
            <template v-for="(test, testPos) in filteredTests">
                <tr><td colspan="0" class="h-2 bg-moon-grey"></td></tr>
                <tr :key="test.id">
                    <td class="h-1 w-500 min-w-500">
                        <edit-test
                            :test="test"
                            :test-pos="testPos"
                            :is-active="currentTest === test"
                            :suite="suite"
                            class="h-full bg-white ml-48"
                            :class="{'bg-proton-grey-opacity-10': currentTest === test}"
                            @onSelected="$emit('onTestSelected', test)"
                            @onDeleted="$emit('onTestSelected', null)"
                        />
                    </td>
                    <template>
                        <template v-for="(run, runPos) in runs">
                            <td class="w-2 bg-moon-grey"></td>
                            <td
                                class="h-1 bg-white cursor-pointer"
                                :key="run.id"
                                @click="$emit('onTestSelected', test); $emit('onRunSelected', run)"
                            >
                                <test-status :test="test" :run-pos="runPos" />
                            </td>
                        </template>
                    </template>
                </tr>
            </template>
        </template>
    </tbody>
</template>

<script>
    import EditGroup from "@/relevance-testing/group/EditGroup";
    import EditTest from "@/relevance-testing/suite/EditTest";
    import GroupStatus from "@/relevance-testing/group/GroupStatus";
    import TestStatus from "@/relevance-testing/test/TestStatus";

    export default {
        name: 'Group',
        props: ['group', 'groupPos', 'runs', 'suite', 'currentTest', 'forceOpen', 'filtering'],
        components: {TestStatus, GroupStatus, EditTest, EditGroup},
        data: function () {
            return {
                collapse: true,
            }
        },
        created: function () {
            this.collapse = (this.suite.groups.length > 1 && this.filteredTests.length > 0) && !this.forceOpen;
        },
        computed: {
            filteredTests: function () {
                return this.group.tests.filter((test) => {
                    if (this.currentTest && test.id === this.currentTest.id) return true;

                    if (this.filtering === 'allPassing') {
                        return this.runs.every((run, index) => test.reports && test.reports[index] && test.reports[index].passing === true);
                    } else if (this.filtering === 'allFailing') {
                        return this.runs.every((run, index) => test.reports && test.reports[index] && test.reports[index].passing === false);
                    } else if (this.filtering === 'onePassing') {
                        return this.runs.some((run, index) => test.reports && test.reports[index] && test.reports[index].passing === true);
                    } else if (this.filtering === 'oneFailing') {
                        return this.runs.some((run, index) => test.reports && test.reports[index] && test.reports[index].passing === false);
                    } else if (this.filtering === 'onePassingOneFailing') {
                        return this.runs.some((run, index) => test.reports && test.reports[index] && test.reports[index].passing === true) &&
                            this.runs.some((run, index) => test.reports && test.reports[index] && test.reports[index].passing === false);
                    }

                    return true;
                });
            },
        },
    }
</script>
