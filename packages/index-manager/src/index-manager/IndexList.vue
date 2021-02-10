<template>
    <div>
        <div v-for="(index, i) in list" class="flex items-center mb-12">
            <app-selector v-model="index.appId" />
            <input
                v-model="index.indexName"
                :ref="`index-list-${i}`"
                class="input-custom mx-8 px-8 py-4 w-124"
                @keyup.enter="addIndex"
            >
            <trash-icon class="w-12 h-12 ml-8 cursor-pointer" @click="list.splice(i, 1)" />
        </div>
        <button
            class="text-sm mt-4 mb-24 white rounded border border-b-0 border-proton-grey-opacity-40 shadow-sm hover:shadow transition-fast-out px-16 p-8 mr-16"
            @click="addIndex"
        >
            Add
        </button>
    </div>
</template>

<script>
    import AppSelector from "common/components/selectors/AppSelector";
    import TrashIcon from 'common/icons/trash.svg';

    export default {
        name: 'IndexList',
        props: ['list'],
        components: {AppSelector, TrashIcon},
        methods: {
            addIndex: function () {
                this.list.push({appId: null, indexName: ''});
                this.$nextTick(() => {
                    this.$refs[`index-list-${this.list.length - 1}`][0].focus();
                });
            }
        }
    }
</script>
