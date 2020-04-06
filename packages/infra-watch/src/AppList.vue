<template>
    <table class="w-full table-fixed">
        <tr v-for="app in list">
            <td class="truncate px-12">{{app.name}}</td>
            <td class="truncate px-12">{{app.email}}</td>
            <td class="truncate ">
                {{app.appName}}
            </td>
            <td class="truncate px-12">
                <a
                    :href="app.adminUrl"
                    class="truncate text-nebula-blue cursor-pointer hover:underline"
                    target="_blank"
                >
                    {{app.appId}}
                </a>
            </td>
            <td class="truncate px-12">{{app.cluster}}</td>
            <td class="truncate px-12">{{app.planName}}</td>
        </tr>
    </table>
</template>

<script>
    export default {
        name: 'AppList',
        props: ['list']
    }
</script>
