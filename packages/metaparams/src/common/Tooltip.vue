<template>
    <div
        :class="[
            !position || position === 'center' ? 'inset-x-auto inset-y-full' : '',
            position === 'left' ? 'left-0 inset-y-full' : '',
            position === 'right' ? 'right-0 -mr-48 inset-y-full' : '',
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