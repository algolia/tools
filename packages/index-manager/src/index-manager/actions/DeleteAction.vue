<template>
    <div>
        <div>
            <div>Type DELETE to confirm you want to delete {{indices.length}} indices:</div>
            <input v-model="confirmText" />
            <div class="flex justify-end mt-16">
                <button
                    v-if="confirmText.toLowerCase() === 'delete'"
                    @click="apply"
                    class="rounded bg-mars-1 shadow-sm hover:shadow transition-fast-out text-white p-8">
                    Confirm Delete
                </button>
                <button
                    @click="toto()"
                    class="white rounded border border-b-0 border-proton-grey-opacity-40 shadow-sm hover:shadow transition-fast-out px-16 p-8 ml-16">
                    Cancel
                </button>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'DeleteAction',
        props: ['indices'],
        data: function () {
            return {
                confirmText: '',
            }
        },
        methods: {
            apply: function () {

            }
        }
    }
</script>