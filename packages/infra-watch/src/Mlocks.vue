<template>
    <div>
        <template v-if="!isEmpty">
            <failing-group :group="failing" group-name="Failing"/>
            <failing-group :group="recovered" group-name="Recovered"/>
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
                return this.failing.length === 0 && this.recovered.length === 0;
            }
        },
    }
</script>
