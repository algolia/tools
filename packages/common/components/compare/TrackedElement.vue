<template>
    <div class="flex">
        <div class="flex truncate pb-4" style="width: calc(100% - 48px);">
                <span class="font-bold">
                    {{String.fromCharCode(97 + index)}}.
                </span>
            <span class="ml-4" v-if="!isLastElement || !editable">
                    {{value}}
            </span>
            <input v-else
                   ref="objectidinput"
                   class="input-custom shadow-sm focus:shadow-sm ml-4 mr-0"
                   :value="value"
                   @input="$emit('input', $event.target.value)"
                   @keyup.enter="addTrackedObjectID"
            />
        </div>
        <div class="ml-auto w-12 h-12">
            <login-icon
                v-if="leftPositions[index] !== -1"
                class="w-full h-full cursor-pointer rotate-180"
                @click="$emit('onClickLeft', leftPositions[index])"
            />
        </div>
        <div class="ml-4 w-12 h-12">
            <login-icon
                v-if="rightPositions[index] !== -1"
                class="w-full h-full cursor-pointer"
                @click="$emit('onClickRight', rightPositions[index])"
            />
        </div>
        <div class="ml-4 w-12 h-12">
            <trash-icon
                v-if="!isLastElement && editable"
                class="w-full h-full ml-4 cursor-pointer"
                @click="$emit('removeTrackedObjectID', index)"
            />
        </div>
    </div>
</template>

<script>
    import TrashIcon from 'common/icons/trash.svg';
    import LoginIcon from 'common/icons/log-in.svg';

    export default {
        name: 'TrackedElement',
        components: {TrashIcon, LoginIcon},
        props: ['value', 'index', 'indexOfTracked', 'isLastElement', 'leftPositions', 'rightPositions', 'editable'],
        created: function () {
            if (this.indexOfTracked > 0) {
                this.$nextTick(() => {
                    if (this.$refs.objectidinput) {
                        this.$refs.objectidinput.focus();
                    }
                });
            }
        },
        methods: {
            addTrackedObjectID: function () {
                this.$emit('addTrackedObjectID');
            }
        }
    }
</script>
