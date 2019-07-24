<template>
    <div class="bg-white m-12">
        <div class="p-8" @click="isOpen = !isOpen">
            {{logItem.operation.toStringFunc(logItem)}}
        </div>
        <div class="p-8" v-if="isOpen">
            <h4 class="mt-12">Request</h4>
            <table>
                <tr>
                    <td class="w-200">Time</td>
                    <td>{{logItem.timestamp}}</td>
                </tr>
                <tr>
                    <td class="w-200">Path</td>
                    <td>{{logItem.verb}} {{logItem.path}}</td>
                </tr>
                <tr>
                    <td class="w-200">IP</td>
                    <td>{{logItem.ip}}</td>
                </tr>
                <tr v-for="(value, key) in logItem.params">
                    <td>{{key}}</td>
                    <td>{{decodeURIComponent(value)}}</td>
                </tr>
            </table>
            <h4 class="mt-12">Engine info</h4>
            <table>
                <tr>
                    <td class="w-200">NB operations</td>
                    <td>{{logItem.nb_operations}}</td>
                </tr>
                <tr>
                    <td class="w-200">Processing time</td>
                    <td>{{logItem.processing_time_ms}} ms</td>
                </tr>
            </table>
            <h4 class="mt-12">Response</h4>
            <table>
                <tr>
                    <td class="w-200">Response code</td>
                    <td>{{logItem.answer_code}}</td>
                </tr>
                <tr>
                    <td class="w-200 align-top">Response</td>
                    <td class="align-top"><pre>{{logItem.response.trim()}}</pre></td>
                </tr>
            </table>
            <pre class="mt-48">
            {{JSON.stringify(logItem.rawLog, null, 2)}}
            </pre>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'Log',
        props: ['logItem'],
        data: function () {
            return {
                isOpen: true,
            }
        }
    }
</script>