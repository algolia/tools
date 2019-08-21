<template>
    <div>
        <div v-for="suite in suites" :key="suite.id">
            {{suite.id}} -
            <router-link :to="`/suites/${suite.id}`">{{suite.name}}</router-link>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'Suites',
        data: function () {
            return {
                suites: [
                    {
                        id: 1,
                        name: 'Suite 1',
                    },
                    {
                        id: 2,
                        name: 'Suite 2',
                    },
                ],
            }
        }
    }
</script>