<template>
  <div
    :class="[
      'bottom-full', // Position tooltip above the child element
      position === 'center' ? 'left-1/2 transform -translate-x-1/2' : '', // Center the tooltip horizontally if 'center'
      position === 'left' ? 'left-0' : '', // Align to the left if 'left'
      position === 'right' ? 'right-0' : '', // Align to the right if 'right'
    ]"
    class="absolute z-10 mb-2 bg-white px-8 py-4 shadow text-solstice-blue text-base border border-proton-grey rounded whitespace-no-wrap hidden group-hover:block"
  >
    <slot />
  </div>
</template>

<script>
    export default {
        name: 'Tooltip',
        props: {
            position: {
                type: String,
                required: true
            }
        }
    }
</script>
