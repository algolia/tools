<template>
  <div class="bg-white border border-proton-grey-opacity-60 rounded overflow-hidden">
    <div class="flex">
      <div
        class="bg-mars-1"
        style="width: 4px; flex: 0 0 4px;"
      />
      <div class="flex-1 p-16">
        <div class="text-mars-1 text-base font-semibold mb-8">
          ✗ {{ title }}
        </div>
        <div class="text-nova-grey text-base whitespace-pre-line">
          {{ message }}
        </div>
        <div class="text-nova-grey text-sm mt-12">
          To reproduce: copy the curl block above and run it in your terminal.
        </div>
      </div>
    </div>
  </div>
</template>

<script>
    export default {
        name: 'ErrorPanel',
        props: {
            title: {
                type: String,
                required: true,
            },
            message: {
                type: String,
                required: true,
            },
        },
    };
</script>
