<template>
    <div>
        <div v-for="(key) in Object.keys(value)" class="pl-12">
            <div class="flex hover:bg-proton-grey-opacity-40 p-1">
                <div>
                    <input-param-value
                        v-bind="$props"
                        :get-value="key"
                        :set-value="setLanguage"
                        :param-spec="paramSpec.key"
                        :prevent-next-input="true"
                        :custom-on-blur="onBlur"
                        v-if="inputState.positionKey === `key.${key}`"
                    />
                    <div v-else @click="inputState.setInput(inputKey, `key.${key}`)">
                        {{JSON.stringify(key)}}
                    </div>
                </div>
                <div>: [</div>
                <trash-icon
                    v-if="status !== 'deleted'"
                    @click="deleteLanguage(key)"
                    class="w-12 h-12 ml-auto cursor-pointer invisible group-hover:visible"
                />
            </div>
            <div class="pl-12">
                <div v-for="(attribute, i) in value[key]">
                    <div class="flex w-full hover:bg-proton-grey-opacity-40 p-1">
                        <input-attribute
                            v-if="inputState.positionKey === `key.${key}.value.${i}`"
                            v-bind="$props"
                            :get-value="attribute"
                            :set-value="setAttribute(key, i)"
                            :custom-on-blur="onBlur"
                            :param-spec="{}"
                            style="max-width: calc(100% - 16px)"
                        />
                        <div v-else @click="inputState.setInput(inputKey, `key.${key}.value.${i}`)">
                            {{JSON.stringify(attribute)}}
                        </div>
                        <trash-icon
                            v-if="status !== 'deleted'"
                            @click="deleteAttribute(key, i)"
                            class="w-12 h-12 ml-auto cursor-pointer invisible group-hover:visible"
                        />
                    </div>
                </div>
                <button
                    v-if="status !== 'deleted'"
                    @click="addAttribute(key)"
                    class="bg-white rounded border border-proton-grey-opacity-40 shadow-sm hover:shadow transition-fast-out mr-8 px-8 p-4 text-sm mt-4"
                >
                    +
                </button>
            </div>
            <div>]</div>
        </div>
        <button
            v-if="status !== 'deleted'"
            @click="addLanguage"
            class="ml-12 bg-white rounded border border-proton-grey-opacity-40 shadow-sm hover:shadow transition-fast-out mr-8 px-8 p-4 text-sm mt-4"
        >
            +
        </button>
    </div>
</template>

<script>
    import inputMixin from "../scripts/inputMixin";
    import InputParamValue from "./InputParamValue";
    import InputAttribute from "./InputAttribute";

    import TrashIcon from "../../../icons/trash.svg"

    export default {
        name: 'InputDecompoundedAttributes',
        mixins: [inputMixin],
        components: {InputAttribute, InputParamValue, TrashIcon},
        created: function () {
            if (Object.keys(this.value).length === 0) {
                this.setParamValue(this.inputKey, {'': []});
                this.inputState.setInput(this.inputKey, `key.`);
            }
            if (this.value[''] !== undefined) {
                this.inputState.setInput(this.inputKey, `key.`);
            }
        },
        methods: {
            onBlur: function () {
                if (this.canBlur) {
                    this.$nextTick(() => {
                        const obj = JSON.parse(JSON.stringify(this.param.value));
                        delete(obj['']);
                        Object.keys(obj).forEach((key) => {
                            obj[key] = obj[key].filter((attr) => attr.length > 0);
                        });
                        this.setParamValue(this.inputKey, obj);
                        this.inputState.setInput('none');
                    });
                }
                this.canBlur = true;
            },
            deleteLanguage: function (lang) {
                const obj = JSON.parse(JSON.stringify(this.value));
                delete(obj[lang]);
                this.setParamValue(this.inputKey, obj);
                this.inputState.setInput('none');
            },
            setLanguage: function (lang, oldLang) {
                this.canBlur = false;
                const obj = JSON.parse(JSON.stringify(this.value));

                if (lang !== oldLang && !obj[lang]) {
                    obj[lang] = obj[oldLang];
                    delete(obj[oldLang]);
                } else {
                    delete(obj['']);
                }

                obj[lang].push('');
                this.setParamValue(this.inputKey, obj);
                this.inputState.setInput(this.inputKey, `key.${lang}.value.${obj[lang].length - 1}`);
            },
            addLanguage: function () {
                this.canBlur = false;
                const obj = JSON.parse(JSON.stringify(this.value));
                obj[''] = [];
                this.setParamValue(this.inputKey, obj);
                this.inputState.setInput(this.inputKey, `key.`);
            },
            addAttribute: function (key) {
                const obj = JSON.parse(JSON.stringify(this.value));
                obj[key].push('');
                this.setParamValue(this.inputKey, obj);
                this.inputState.setInput(this.inputKey, `key.${key}.value.${obj[key].length - 1}`);
            },
            deleteAttribute: function (key, attributePos) {
                const obj = JSON.parse(JSON.stringify(this.value));
                obj[key].splice(attributePos, 1);
                this.setParamValue(this.inputKey, obj);
                this.inputState.setInput(this.inputKey, `none`);
            },
            setAttribute: function (key, attributePos) {
                return (val) => {
                    const over = val === '';
                    const obj = JSON.parse(JSON.stringify(this.value));
                    obj[key][attributePos] = val;

                    if (!over) {
                        obj[key].push('');
                        this.setParamValue(this.inputKey, obj);
                        this.inputState.setInput(this.inputKey, `key.${key}.value.${obj[key].length - 1}`);
                    } else {
                        obj[key] = obj[key].filter((attr) => attr.length > 0);
                        this.setParamValue(this.inputKey, obj);
                        this.inputState.setInput('root', `key.${key}.value.${obj[key].length - 1}`);
                    }
                }
            },
        }
    }
</script>