<template>
    <div>
        <h2 class="mt-24 text-solstice-blue-opacity-80">Transform</h2>
        <div>
            <div class="grid" :style="`grid-template-columns: ${fullscreen ? '50% 50%': '33.3333% 33.3333% 33.3333%'}; grid-template-rows: ${fullscreen ? 'auto auto' : 'auto'};`">
                <div class="mt-24 pr-24 align-top" :style="`${fullscreen ? 'grid-area: 1 / 1 / 2 / 2': 'grid-area: 1 / 1 / 2 / 2'};`">
                    <div class="bg-white rounded border border-proton-grey-opacity-60">
                        <div class="text-center p-8 border-b border-proton-grey-opacity-60 bg-proton-grey-opacity-40 text-telluric-blue text-xs uppercase tracking-wide">
                            Old Record
                        </div>
                        <div class="p-24">
                            <attributes
                                v-if="srcObjectExample"
                                :top-attributes="['objectID']"
                                :no-collapse="true"
                                class="w-full"
                                :item="hitsTransformer.transformObj(srcObjectExample)._v_"
                            />
                        </div>
                        <div class="flex">
                            <pagination
                                @onUpdatePage="page = $event"
                                :page="page"
                                :nb-pages="nbPages"
                                class="mx-auto"
                            />
                        </div>
                    </div>
                </div>
                <div class="mt-24 pr-24" :style="`${fullscreen ? 'grid-area: 2 / 1 / 3 / 4': 'grid-area: 1 / 2 / 2 / 3'};`">
                    <div>
                        <div class="relative text-center p-8 rounded border border-proton-grey-opacity-60 bg-proton-grey-opacity-40 text-telluric-blue text-xs uppercase tracking-wide">
                            Transformer
                            <maximize-icon v-if="!fullscreen" @click="toggleFullScreen" class="w-12 h-12 cursor-pointer absolute top-0 right-0 mr-8 mt-8" />
                            <minimize-icon v-if="fullscreen" @click="toggleFullScreen" class="w-12 h-12 cursor-pointer absolute top-0 right-0 mr-8 mt-8" />
                        </div>
                        <div class="mt-24">
                            <monaco-editor
                                v-model="transformer"
                                class="w-full h-512 rounded overflow-hidden"
                                language="javascript"
                                @onShouldSave="saveTransformer(saveAs)"
                            />
                        </div>
                        <div class="flex items-center mt-8">
                            <div class="text-center" :class="{invisible: !hasBeenSaved}">
                                Saved {{savedConfig === 'new' ? 'draft' : savedConfig}}!
                            </div>
                            <div class="ml-auto">
                                <a
                                    @click="transformer = generatedConfig()"
                                    class="text-nebula-blue cursor-pointer hover:underline"
                                >auto-generate</a>
                            </div>
                            <div class="ml-16">
                                <a
                                    @click="reset()"
                                    class="text-nebula-blue cursor-pointer hover:underline"
                                >reset</a>
                            </div>
                        </div>
                    </div>
                    <div class="mt-12 text-solstice-blue-opacity-60">
                        <div class="flex">
                            <div class="w-half">
                                <h3 class="mb-12">Help</h3>
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
                            <div class="w-half">
                                <h3 class="mb-12">Current Draft</h3>
                                <div>
                                    <div class="flex ml-auto">
                                        <div>Save as:</div>
                                        <input
                                            v-model="saveAs"
                                            @keyup.enter="saveTransformer(saveAs, true)"
                                            class="ml-8 input-custom w-124"
                                        />
                                    </div>
                                </div>
                                <h3 class="mt-12 mb-12">Backups</h3>
                                <div>
                                    <div v-for="t in notNewTransformers" class="flex">
                                        <div class="w-full group">
                                            -
                                            <a
                                                @click="transformer = t.body; saveTransformer()"
                                                class="text-nebula-blue cursor-pointer hover:underline"
                                            >{{t.name}}</a>
                                            <trash-icon
                                                @click="deleteTransformer(t.name)"
                                                class="ml-12 w-12 h-12 cursor-pointer hover:text-telluric-blue invisible group-hover:visible"
                                            />
                                        </div>
                                    </div>
                                    <div v-if="notNewTransformers.length === 0">
                                        No backups
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="mt-24 pr-24" :style="`${fullscreen ? 'grid-area: 1 / 2 / 2 / 3': 'grid-area: 1 / 3 / 2 / 4'};`">
                    <div class="bg-white rounded border border-proton-grey-opacity-60">
                        <div class="text-center p-8 border-b border-proton-grey-opacity-60 bg-proton-grey-opacity-40 text-telluric-blue text-xs uppercase tracking-wide">
                            New record
                        </div>
                        <div class="p-24">
                            <attributes
                                v-if="!error && dstObjectExample"
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
    import Pagination from "common/components/explorer/results/Pagination";
    import TrashIcon from "common/icons/trash.svg";
    import MaximizeIcon from "common/icons/maximize.svg";
    import MinimizeIcon from "common/icons/minimize.svg";
    import {isNumeric, isObject, isString} from "common/utils/types";
    import transformContext from "./transformContext";

    const defaultTransformer = 'return {\n  ...refObj,\n\n};';

    export default {
        name: 'Transformer',
        components: {MonacoEditor, Attributes, Pagination, TrashIcon, MaximizeIcon, MinimizeIcon},
        props: ['dataset'],
        data: function () {
            return {
                fullscreen: false,
                dstObjectExample: {},
                transformer: defaultTransformer,
                error: null,
                page: 0,
                hitsTransformer: new HitsTransformer(),
                timeout: null,
                saveAs: '',
                savedConfig: '',
                hasBeenSaved: false,
                transformers: [],
            }
        },
        created: function () {
            this.transformExample();
            this.fetchTransformers();
        },
        watch: {
            transformer: function (o, n) {
                if (o !== n) {
                    this.page = 0;
                    this.transformExample();
                    this.saveTransformerWithTimeout('new');
                }
            },
            srcObjectExample: function () { this.transformExample(); },
        },
        computed: {
            srcObjectExample: function () {
                if (this.dataset && this.dataset.length > 0) {
                    return this.dataset[this.page];
                }
            },
            nbPages: function () {
                if (!this.dataset) return 0;
                return this.dataset.length;
            },
            notNewTransformers: function () {
                return this.transformers.filter((t) => t.name !== 'new');
            },
        },
        methods: {
            reset: function () {
                this.transformer = defaultTransformer;
            },
            getFinalKeyName: function (key) {
                if (key.includes('-') || key.includes('.')) return `'${key}'`;
                return key;
            },
            getFinalVarName: function (varNames) {
                let finalVarName = varNames[0];
                for (let i = 1; i < varNames.length; i++) {
                    if (varNames[i].includes('-') || varNames[i].includes('.')) {
                        finalVarName += `['${varNames[i]}']`;
                    } else {
                        finalVarName += `.${varNames[i]}`;
                    }
                }

                return finalVarName;
            },
            getValue: function(key, varNames, value) {
                const finalVarName = this.getFinalVarName(varNames);
                if (isString(value) && isNumeric(value)) {
                    if (varNames.length <= 2) {
                        return `${varNames[0]} !== undefined ? parseFloat(${finalVarName}) : undefined,\n`;
                    } else {
                        return `parseFloat(${finalVarName}),\n`;
                    }
                } else if (Array.isArray(value)) {
                    return `${finalVarName} === undefined ? undefined : this.getArrayValue(${finalVarName}).map((el) => {\n    return el;  \n  }),\n`;
                } else {
                    if (varNames.length <= 2) {
                        return `${varNames[0]} !== undefined ? ${finalVarName} : undefined,\n`;
                    } else {
                        return `${finalVarName},\n`;
                    }
                }
            },
            generatedConfig: function () {
                const hit = this.srcObjectExample;
                let s = 'return {\n';

                Object.keys(hit).forEach((key) => {
                    let refObjVarName = this.getFinalVarName(['refObj', key]);
                    let value = hit[key];

                    if (isObject(value)) {
                        const keys = Object.keys(value);

                        if (keys.length > 0) {
                            const hasAttrs = keys.includes('attrs');

                            if (keys.length === 1 && !hasAttrs) {
                                s += `  ${this.getFinalKeyName(key)}: ${this.getValue(key, [refObjVarName, keys[0]], value[keys[0]])}`;
                                return;
                            }

                            s += `  ${this.getFinalKeyName(key)}: {\n`;
                            if (hasAttrs) {
                                const attrKeys = Object.keys(value.attrs);
                                attrKeys.forEach((k) => {
                                    s += `    ${this.getFinalKeyName(k)}: ${this.getValue(k, [refObjVarName, 'attrs', k], value[k])}`;
                                });
                            }

                            keys.filter((k) => k !== 'attrs' && (k !== 'value' || value[k])).forEach((k) => {
                                s += `    ${this.getFinalKeyName(k)}: ${this.getValue(k, [refObjVarName, k], value[k])}`;
                            });
                            s += `  },\n`;
                            return;
                        }
                    }

                    s += `  ${this.getFinalKeyName(key)}: ${this.getValue(key, [refObjVarName], value)}`;
                });

                s += '}';
                return s;
            },
            saveTransformerWithTimeout: function (name, reloadTransformers) {
                if (this.timeout) {
                    clearTimeout(this.timeout);
                }

                this.timeout = setTimeout(() => {
                    this.saveTransformer(name, reloadTransformers);
                }, 3000);
            },
            saveTransformer: async function (name, reloadTransformers) {
                clearTimeout(this.timeout);
                const endpoint = process.env.VUE_APP_METAPARAMS_BACKEND_ENDPOINT || 'https://tools-backend.algolia.com';
                await fetch(`${endpoint}/transformations/update`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name: name || 'new',
                        body: this.transformer,
                    }),
                });
                this.savedConfig = name || 'new';
                this.hasBeenSaved = true;
                setTimeout(() => {
                    this.hasBeenSaved = false;
                }, 2000);
                if (reloadTransformers) {
                    this.fetchTransformers();
                }
            },
            fetchTransformers: async function () {
                const endpoint = process.env.VUE_APP_METAPARAMS_BACKEND_ENDPOINT || 'https://tools-backend.algolia.com';
                const res = await fetch(`${endpoint}/transformations/get-all`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({}),
                });
                const transformers = Object.freeze(await res.json());
                if (transformers.length <= 0) {
                    await this.saveTransformer('new');
                    this.fetchTransformers();
                } else {
                    this.transformer = transformers.find((t) => t.name === 'new').body;
                }
                this.transformers = transformers;
            },
            deleteTransformer: async function (name) {
                const endpoint = process.env.VUE_APP_METAPARAMS_BACKEND_ENDPOINT || 'https://tools-backend.algolia.com';
                await fetch(`${endpoint}/transformations/delete`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name: name,
                    }),
                });
                this.fetchTransformers();
            },
            transformExample: async function () {
                try {
                    const func = new Function(`return async function (refObj) {\n ${this.transformer} \n}`)();
                    this.dstObjectExample = await func.call(transformContext, Object.freeze(JSON.parse(JSON.stringify(this.srcObjectExample))));
                    this.error = null;
                    this.$emit('onUpdateTransformer', func);
                } catch (e) {
                    this.error = e;
                    this.dstObjectExample = {};
                    this.$emit('onUpdateTransformer', null);
                }
            },
            toggleFullScreen: function () {
                this.fullscreen = !this.fullscreen;
                this.$nextTick(() => window.dispatchEvent(new Event('resize')));
            }
        }
    }
</script>
