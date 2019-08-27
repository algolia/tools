<template>
    <div>
        <div
            @click="closePanel"
            :class="open ? 'uncollapsed' : 'collapsed'"
            class="transition rotate fixed z-10 rotate-270 inset-y-full overflow-hidden"
            style="left: 422px; top: calc((100vh - 94px) / 2 - 48px);"
        >
            <div
                class="mt-12 ml-12 mr-12 text-sm text-proton-grey rounded-tl rounded-tr bg-white cursor-pointer px-24 py-8"
                style="box-shadow: 0 -4px 11px 0 rgba(37, 44, 97, 0.15), 0 -1px 3px 0 rgba(93, 100, 148, 0.2)"
            >
                <x-icon class="w-12 h-12 mr-4" /> Close
            </div>
        </div>
        <div
            :class="open ? 'uncollapsed' : 'collapsed'"
            class="transition fixed h-full right-0 shadow bg-white"
            style="width: calc(100vw - 500px); height: calc(100vh - 94px); top: 94px;"
        >
            <slot name="default" />
        </div>
    </div>
</template>

<style>
    .transition {
        transition: transform 0.6s;
        transition-timing-function: ease-in-out;
    }

    .uncollapsed {
        transform: translateX(0);
    }

    .collapsed {
        transform: translateX(calc(100vw + 100px));
    }
    .rotate {
        transform: rotate(270deg) translateX(-100%);
    }

    .rotate.uncollapsed {
        transform: rotate(270deg) translateX(-100%);
    }

    .rotate.collapsed {
        transform: rotate(270deg) translateX(-100%) translateY(calc(100vw + 100px));
    }
</style>

<script>
    import XIcon from "common/icons/x.svg";

    export default {
        name: 'SlidingPanel',
        components: {XIcon},
        data: function () {
            return {
                open: false,
            };
        },
        created: function () {
            const $this = this;

            this.$root.$on('onClosePanel', () => {
                this.closePanel();
            });

            this.$nextTick(() => {
                window.setTimeout(() => {
                    $this.open = true;
                }, 1);
            });
        },
        methods: {
            closePanel: function () {
                const $this = this;
                this.open = false;
                this.$nextTick(() => {
                    window.setTimeout(() => {
                        $this.$emit('onClosePanel');
                    }, 600);
                });
            },
        }
    }
</script>