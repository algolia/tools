<template>
    <div
        :class="[
            !position || position === 'center' ? 'pin-x-auto-y-full' : '',
            position === 'left' ? 'pin-l pin-y-full' : '',
            position === 'right' ? 'pin-r -mr-48 pin-y-full' : '',
        ]"
        class="absolute z-10 -mt-4 bg-white px-8 py-4 shadow text-solstice-blue text-base border border-proton-grey rounded whitespace-no-wrap hidden group-hover:block"
    >
        <slot />
    </div>
</template>

<script>
    export default {
        name: 'Tooltip',
        props: ['position']
    }
</script>