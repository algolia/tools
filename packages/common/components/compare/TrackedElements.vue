<template>
    <div>
        <div
            v-for="(objectID, index) in trackedElements"
            class="flex"
        >
            <div class="flex truncate pb-4" style="width: calc(100% - 48px);">
                <span class="font-bold">
                    {{String.fromCharCode(97 + index)}}.
                </span>
                <span class="ml-4" v-if="index < trackedElements.length - 1">
                    {{objectID}}
                </span>
                <input v-else
                       ref="objectidinput"
                       class="input-custom shadow-sm focus:shadow-sm ml-4 mr-0"
                       v-model="trackedElements[trackedElements.length - 1]"
                       @input="$emit('input', trackedElements)"
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
                    v-if="index < trackedElements.length - 1"
                    class="w-full h-full ml-4 cursor-pointer"
                    @click="removeTrackedObjectID(index)"
                />
            </div>
        </div>
    </div>
</template>

<script>
    import TrashIcon from 'common/icons/trash.svg';
    import LoginIcon from 'common/icons/log-in.svg';

    export default {
        name: 'TrackedElements',
        components: {TrashIcon, LoginIcon},
        props: ['value', 'leftPositions', 'rightPositions'],
        data: function () {
            return {
                trackedElements: JSON.parse(JSON.stringify(this.value)),
            }
        },
        methods: {
            addTrackedObjectID: function () {
                if (this.trackedElements[this.trackedElements.length - 1].length > 0) {
                    this.trackedElements.push('');
                    this.$nextTick(() => {
                        this.$refs.objectidinput[0].focus();
                    });
                    this.$emit('input', this.trackedElements);
                }
            },
            removeTrackedObjectID: function (index) {
                this.trackedElements.splice(index, 1);
                this.$emit('input', this.trackedElements);
            },
        }
    }
</script>