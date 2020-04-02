<template>
    <div>
        <template v-if="!isEmpty">
            <failing-group :infras="failing" group-name="Failing"/>
            <failing-group :infras="recovered" group-name="Recovered" class="mt-24"/>
        </template>
        <div v-else class="p-8 text-center text-cosmos-black-opacity-70">
            No problem
        </div>
    </div>
</template>

<script>
    import FailingGroup from "./FailingGroup";

    export default {
        name: 'Mlocks',
        props: ['failing', 'recovered'],
        components: {FailingGroup},
        computed: {
            isEmpty: function () {
                return Object.keys(this.failing).length === 0 && Object.keys(this.recovered).length === 0;
            }
        },
    }
</script>
