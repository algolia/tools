<template>
    <div>
        <h2 class="mt-24 text-solstice-blue-opacity-80">Transform</h2>
        <div class="mt-24">
            <div class="flex">
                <div class="w-third pr-24">
                    <div class="bg-white rounded border border-proton-grey-opacity-60">
                        <div class="text-center p-8 border-b border-proton-grey-opacity-60 bg-proton-grey-opacity-40 text-telluric-blue text-xs uppercase tracking-wide">
                            Old Record
                        </div>
                        <div class="p-24">
                            <attributes
                                :top-attributes="['objectID']"
                                :no-collapse="true"
                                class="w-full"
                                :item="hitsTransformer.transformObj(srcObjectExample)._v_"
                            />
                        </div>

                    </div>
                </div>
                <div class="w-third pr-24">
                    <div>
                        <div class="text-center p-8 rounded border border-proton-grey-opacity-60 bg-proton-grey-opacity-40 text-telluric-blue text-xs uppercase tracking-wide">
                            Transformer
                        </div>
                        <div class="mt-24">
                            <monaco-editor
                                v-model="transformer"
                                class="w-full h-256 rounded overflow-hidden"
                                language="javascript"
                            />
                        </div>
                    </div>
                    <div class="mt-24 text-solstice-blue-opacity-60">
                        <div>
                            Return Object to modify the object
                            <br>
                            Return Array to split records
                            <br>
                            Return null to not index the record
                            <br>
                            <br>
                            async/await is allowed
                            <br>
                            this.algoliasearch gives you access to algolia lib
                        </div>
                    </div>
                </div>
                <div class="w-third pr-24">
                    <div class="bg-white rounded border border-proton-grey-opacity-60">
                        <div class="text-center p-8 border-b border-proton-grey-opacity-60 bg-proton-grey-opacity-40 text-telluric-blue text-xs uppercase tracking-wide">
                            New record
                        </div>
                        <div class="p-24">
                            <attributes
                                v-if="!error"
                                class="w-full"
                                :top-attributes="['objectID']"
                                :no-collapse="true"
                                :item="hitsTransformer.transformObj(dstObjectExample)._v_"
                            />
                            <div v-else>
                                {{error}}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import MonacoEditor from "./MonacoEditor";
    import Attributes from "common/components/explorer/hits/Attributes";
    import HitsTransformer from "common/components/explorer/hits/hitsTransformer";
    import algoliasearch from 'algoliasearch';

    export default {
        name: 'Transformer',
        components: {MonacoEditor, Attributes},
        props: ['dataset'],
        data: function () {
            return {
                dstObjectExample: {},
                transformer: 'return {\n  ...refObj,\n\n};',
                error: null,
                hitsTransformer: new HitsTransformer(),
            }
        },
        created: function () {
            this.transformExample();
        },
        watch: {
            transformer: function () { this.transformExample(); },
            srcObjectExample: function () { this.transformExample(); },
        },
        computed: {
            srcObjectExample: function () {
                if (this.dataset && this.dataset.length > 0) {
                    return this.dataset[0];
                }
            },
        },
        methods: {
            transformExample: async function () {
                try {
                    const context = {
                        algoliasearch: algoliasearch,
                    };

                    const func = eval(`(async function (refObj) {\n ${this.transformer} \n})`);
                    this.dstObjectExample = await func.call(context, this.srcObjectExample);
                    this.error = null;
                    this.$emit('onUpdateTransformer', func);
                } catch (e) {
                    this.error = e;
                    this.dstObjectExample = {};
                    this.$emit('onUpdateTransformer', null);
                }
            },
        }
    }
</script>
