<template>
    <div>
        <app-global-selector v-model="app" />
    </div>
</template>

<script>
    import AppGlobalSelector from "common/components/selectors/AppGlobalSelector";

    export default {
        name: 'Inspect',
        components: {AppGlobalSelector},
        data: function () {
            return {
                app: null,
            }
        }
    }
</script>
