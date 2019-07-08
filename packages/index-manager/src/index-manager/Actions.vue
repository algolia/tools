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
        <component
            v-if="currentAction"
            v-bind:is="currentAction.component"
            :indices="indices"
            class="p-16"
        />
    </div>
</template>

<script>
    import DeleteAction from '@/index-manager/actions/DeleteAction';

    export default {
        name: 'Actions',
        data: function () {
            return {
                selected: {},
                currentAction: null,
                actions: [
                    {
                        name: 'delete',
                        component: DeleteAction,
                        condition: (indices) => indices.length > 0,
                    },
                    {
                        name: 'clear',
                        component: DeleteAction,
                        condition: (indices) => indices.length > 0,
                    },
                    {
                        name: 'rename',
                        component: DeleteAction,
                        condition: (indices) => indices.length > 0,
                    },
                    {
                        name: 'attach',
                        component: DeleteAction,
                        condition: (indices) => indices.length > 0,
                    },
                    {
                        name: 'detach',
                        component: DeleteAction,
                        condition: (indices) => indices.length > 0,
                    },
                    {
                        name: 'copy',
                        component: DeleteAction,
                        condition: (indices) => indices.length > 0,
                    },
                    {
                        name: 'resetSettings',
                        component: DeleteAction,
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