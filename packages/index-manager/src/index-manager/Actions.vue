<template>
    <div class="p-16">
        <div>
            <div>Selected {{indices.length}} indices:</div>
            <ul>
                <li v-for="index in indices">
                    {{index.name}}
                </li>
            </ul>
        </div>
        <div class="flex">
            <div
                v-for="action in validActions"
                class="bg-white rounded border border-b-0 border-proton-grey-opacity-40 shadow-sm hover:shadow transition-fast-out mr-8 px-16 p-8 text-sm mr-12 cursor-pointer"
                :class="currentAction === action ? 'bg-mars-1 text-white' : ''"
                @click="currentAction = action"
            >
                {{action.name}}
            </div>
        </div>
        <action
            v-if="currentAction"
            :indices="indices"
            :client="client"
            :action="currentAction"
            class="p-16"
        />
    </div>
</template>

<script>
    import Action from '@/index-manager/Action';

    export default {
        name: 'Actions',
        components: {Action},
        props: ['client'],
        data: function () {
            return {
                selected: {},
                currentAction: null,
                actions: [
                    {
                        name: 'delete',
                        description: 'Delete indices',
                        confirmText: 'DELETE',
                        condition: (indices) => indices.length > 0,
                    },
                    {
                        name: 'clear',
                        description: 'Clear indices',
                        confirmText: 'CLEAR',
                        condition: (indices) => indices.length > 0,
                    },
                    {
                        name: 'rename',
                        description: 'Rename index',
                        confirmText: 'RENAME',
                        condition: (indices) => indices.length > 0,
                    },
                    {
                        name: 'attach',
                        description: 'Attach replica',
                        confirmText: 'ATTACH',
                        condition: (indices) => indices.length > 0,
                    },
                    {
                        name: 'detach',
                        description: 'Delete replica',
                        confirmText: 'DETACH',
                        condition: (indices) => indices.length > 0,
                    },
                    {
                        name: 'copy',
                        description: 'Copy index',
                        confirmText: 'COPY',
                        condition: (indices) => indices.length > 0,
                    },
                    {
                        name: 'resetSettings',
                        description: 'Reset settings',
                        confirmText: 'RESET',
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