<template>
    <div class="w-full">
        <div class="min-w-full cursor-pointer" v-if="!isEditing" @click="isEditing = true">
            <span v-if="key">{{key.substring(0, 4) + key.substring(4).replace(/./g, '*')}}</span>
            <span v-else>&lt;empty&gt;</span>
        </div>
        <input
            v-model="key"
            v-if="isEditing"
            @keyup.enter="isEditing = false"
            @blur="isEditing = false"
            ref="editKey"
            class="w-full bg-proton-grey-opacity-20 p-4"
        />
    </div>
</template>

<script>
    export default {
        name: 'EditKey',
        props: ['keyName', 'appId'],
        data: function () {
            return {
                isEditing: false,
            }
        },
        computed: {
            key: {
                get () {
                    return this.$store.state.apps[this.appId][this.keyName] || '';
                },
                set (value) {
                    this.$store.commit(`apps/${this.appId}/setKey`, { keyName: this.keyName, value: value });
                }
            }
        },
        watch: {
            isEditing: function () {
                if (this.isEditing) {
                    this.$nextTick(() => {
                        this.$refs.editKey.focus();
                    });
                }
            }
        }
    }
</script>
