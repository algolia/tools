<template>
    <div v-if="Object.keys(infras).length > 1">
        <h2 class="text-solstice-blue-opacity-80">
            {{groupName}}
        </h2>
        <template v-for="key in infras.__keys__">
            <infra :infra="infras[key]" />
        </template>
    </div>

</template>

<script>
    import Infra from "./Infra";
    export default {
        name: 'FailingGroup',
        components: {Infra},
        props: ['infras', 'groupName'],
    }
</script>
