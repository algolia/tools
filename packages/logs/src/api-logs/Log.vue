<template>
    <div>
        <div class="flex p-8 cursor-pointer" @click="isOpen = !isOpen">
            <div class="mr-16 text-nova-grey w-68">{{timeDiff}}</div>
            <div class="flex flex-1 flex-wrap">
                <div
                    class="w-70p"
                    v-html="logItem.operation.toStringFunc(logItem).replace(/<code>/g, '<span class=\'bg-proton-grey-opacity-50 px-4 rounded text-sm\'>').replace(/<\/code>/g, '</span>')"
                ></div>
                <div class="w-30p ml-auto break-all">
                    <div>
                        <span class="text-nova-grey-opacity-60">{{logItem.server}}</span>
                        {{logItem.verb}} {{logItem.path}}
                    </div>
                </div>
            </div>
            <div class="ml-auto">
                <div class="ml-12 py-2 px-4 rounded text-sm leading-none" :class="logItem.answer_code === '200' ? 'text-white bg-jupiter-6' : 'bg-mars-1 text-white'">
                    {{logItem.answer_code}}
                </div>
            </div>
        </div>
        <div class="p-8" v-if="isOpen">
            <h3 class="my-12">Request</h3>
            <div class="flex">
                <div class="w-half pr-48">
                    <h4 class="p-8">Info</h4>
                    <table class="w-full">
                        <tr v-for="(value, key) in infoObject" class="border-t border-proton-grey-opacity-50">
                            <td class="p-8 w-160 break-all">{{key}}</td>
                            <td class="p-8 break-all">{{value}}</td>
                        </tr>
                    </table>
                </div>
                <div class="w-half pr-48">
                    <h4 class="p-8">Url params</h4>
                    <table class="w-full">
                        <tr v-for="(value, key) in logItem.params.url" class="border-t border-proton-grey-opacity-50">
                            <td class="p-8 w-160 break-all">{{key}}</td>
                            <td class="p-8 break-all">{{decodeURIComponent(value)}}</td>
                        </tr>
                    </table>
                </div>
            </div>
            <div class="mt-24">
                <div class="flex">
                    <div class="w-half pr-48">
                        <div v-if="logItem.params.bodies.length === 0">
                            <h4  class="p-8">Body</h4>
                            <div
                                v-if="!logItem.params.rawBody || logItem.params.rawBody.length === 0"
                                class="border-t border-proton-grey-opacity-50 p-8">
                                No body
                            </div>
                        </div>
                        <div v-for="(body, index) in logItem.params.bodies">
                            <h4 class="p-8" :class="index > 0 ? 'mt-24': ''">
                                Body <span v-if="logItem.params.bodies.length > 1">(Request {{index + 1}})</span>
                            </h4>
                            <table>
                                <tr v-for="(value, key) in body" class="border-t border-proton-grey-opacity-50">
                                    <td class="p-8 w-160 break-all align-top">{{key}}</td>
                                    <td v-if="key !== 'params'">{{decodeURIComponent(value)}}</td>
                                    <td v-if="key === 'params'">
                                        <table>
                                            <tr v-for="(value2, key2) in value" class="border-t border-proton-grey-opacity-50">
                                                <td class="p-8">{{key2}}</td>
                                                <td class="p-8 break-all">{{decodeURIComponent(value2)}}</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </div>
                        <div v-if="logItem.params.rawBody" class="p-8">
                            <pre>{{logItem.params.rawBody}}</pre>
                        </div>
                    </div>
                    <div class="w-half pr-48">
                        <h4 class="p-8">Headers</h4>
                        <table>
                            <tr v-for="(value, key) in logItem.params.headers" class="border-t border-proton-grey-opacity-50">
                                <td class="p-8 w-160 break-all">{{key}}</td>
                                <td class="p-8 break-all">{{decodeURIComponent(value)}}</td>
                            </tr>
                        </table>
                    </div>
                </div>
            </div>
            <div class="mt-24">
                <h3>Response</h3>
                <div class="p-8">
                    <pre>{{logItem.response.trim()}}</pre>
                    <!--<pre class="mt-48">{{JSON.stringify(logItem.rawLog, null, 2)}}</pre>-->
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'Log',
        props: ['logItem', 'nowDate'],
        data: function () {
            return {
                isOpen: false,
            }
        },
        computed: {
            timeDiff: function () {
                const secondDiff = Math.max(0, this.nowDate.getTime() / 1000 - new Date(this.logItem.timestamp).getTime() / 1000);
                if (secondDiff < 60) {
                    return `${Math.floor(secondDiff)} sec ago`;
                }
                if (secondDiff < 60 * 60) {
                    return `${Math.floor(secondDiff / 60)} min ago`;
                }
                if (secondDiff < 60 * 60 * 24) {
                    return `${Math.floor(secondDiff / 60 / 60)}h ago`;
                }
                if (secondDiff < 60 * 60 * 24 * 30) {
                    return `${Math.floor(secondDiff / 60 / 60 / 24)}d ago`;
                }
                return `${Math.floor(secondDiff / 60 / 60 / 24 / 30)}m ago`;
            },
            infoObject: function () {
                return {
                    'Time': this.logItem.timestamp,
                    'IP': this.logItem.ip,
                    'NB operations': this.logItem.nb_operations,
                    'Processing time': this.logItem.processing_time_ms
                };
            }
        }
    }
</script>
