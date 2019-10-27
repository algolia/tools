<template>
    <div class="flex min-h-full rounded bg-white border border-solid border-proton-grey-opacity-60">
        <div class="w-200 max-w-200 min-w-200">
            <div class="text-telluric-blue text-xs uppercase tracking-wide flex items-center border-b border-proton-grey-opacity-60 bg-white p-8 bg-proton-grey-opacity-40">
                <div class="mr-auto">
                    {{indices.length}} indices selected
                </div>
            </div>
            <div class="bg-white p-16">
                <ul>
                    <li v-for="index in indices">
                        {{index.name}}
                    </li>
                </ul>
            </div>
        </div>
        <div class="border-l border-proton-grey-opacity-60" style="width: calc(100% - 200px);">
            <div class="text-telluric-blue text-xs uppercase tracking-wide flex items-center border-b border-proton-grey-opacity-60 bg-white p-8 bg-proton-grey-opacity-40">
                <div class="mr-auto">
                    Actions
                </div>
            </div>
            <div class="p-16">
                <small-tabs
                    :tabs="validActions.map((action) => {
                    return { value: action, name: action.name };
                })"
                    v-model="currentAction"
                />
                <action
                    v-if="currentAction"
                    :indices="indices"
                    :client="client"
                    :action="currentAction"
                    class="mt-24"
                />
            </div>
        </div>
    </div>
</template>

<script>
    import Action from '@/index-manager/Action';
    import SmallTabs from 'common/components/tabs/SmallTabs';

    export default {
        name: 'Actions',
        components: {Action, SmallTabs},
        props: ['client'],
        data: function () {
            return {
                selected: {},
                currentAction: null,
                currentTab: 'Rename',
                actions: [
                    {
                        name: 'Rename',
                        description: 'Rename index',
                        confirmText: 'RENAME',
                        condition: (indices) => indices.length === 1,
                    },
                    {
                        name: 'Clear',
                        actionName: 'clear',
                        description: 'Clear indices',
                        confirmText: 'CLEAR',
                        condition: (indices) => indices.length > 0 && indices.every((index) => index.primary === undefined),
                    },
                    {
                        name: 'Delete',
                        actionName: 'delete',
                        description: 'Delete indices',
                        confirmText: 'DELETE',
                        condition: (indices) => indices.length > 0,
                    },
                    {
                        name: 'Copy',
                        description: 'Copy index',
                        confirmText: 'COPY',
                        condition: (indices) => indices.length === 1,
                    },
                    {
                        name: 'Replicas',
                        description: 'Update replicas',
                        confirmText: 'REPLICAS',
                        condition: (indices) => indices.length === 1 && indices[0].primary === undefined,
                    },
                    {
                        name: 'Detach',
                        actionName: 'detach',
                        description: 'Detach replicas',
                        confirmText: 'DETACH',
                        condition: (indices) => indices.length > 0 && indices.every((index) => index.primary !== undefined),
                    },
                    {
                        name: 'Reset settings',
                        actionName: 'reset settings',
                        description: 'Reset settings',
                        confirmText: 'RESET',
                        condition: (indices) => indices.length > 0,
                    },
                    {
                        name: 'Apply settings',
                        description: 'Apply settings',
                        confirmText: 'APPLY',
                        condition: (indices) => indices.length > 0,
                    },
                ]
            }
        },
        computed: {
            indices: function () {
                return Object.values(this.selected);
            },
            validActions: function () {
                return this.actions.filter((action) => action.condition(this.indices));
            }
        },
        created: function () {
            this.$root.$on('onSelectedUpdated', (selected) => {
                this.currentAction = null;
                this.selected = selected;
            });
        },
    }
</script>
