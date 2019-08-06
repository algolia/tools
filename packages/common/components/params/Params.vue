<template>
    <div>
        <div>
            <div :key="key" v-for="(key, index) in keys">
                <param-value
                    :id="id"
                    :panel-key="panelKey"
                    :ref="key"
                    :input-key="key"
                    :config-key="configKey"
                    :panel-keys-indexer="panelKeysIndexer"
                    :set-param-value="setParamValue"
                    :add-array-element="addArrayElement"
                    :delete-array-element="deleteArrayElement"
                    :set-param-enabled="setParamEnabled"
                    :delete-key="deleteKey"
                    :restore-key="restoreKey"
                    :param="params[key]"
                    :ref-param="refParams[key]"
                    :raw-param="rawParams[key]"
                    :is-last-element="index === keys.length - 1"
                ></param-value>
            </div>
        </div>
        <input-param-name
            :id="id"
            input-key="root"
            :config-key="configKey"
            :set-param-value="setParamValue"
            :class="keys.length > 0 ? 'mt-8': ''"
            :display-value="configKey === 'indexSettings' ? 'Add index settings' : 'Add search param'"
        />
    </div>
</template>

<script>
    import ParamValue from "./ParamValue";
    import InputParamName from "./input/InputParamName";
    import paramsInputState from "./scripts/paramsInputState";

    export default {
        name: 'Params',
        props: ['id', 'panelKey', 'configKey', 'keys', 'params', 'refParams', 'rawParams', 'panelKeysIndexer'],
        components: {InputParamName, ParamValue},
        methods: {
            setParamValue: function (key, value) {
                this.$emit('onSetParamValue', key, value);
            },
            setParamEnabled: function (key, value) {
                this.$emit('onSetParamEnabled', key, value);
            },
            addArrayElement: function (inputKey) {
                this.$emit('onAddArrayElement', inputKey);
                paramsInputState(this.id).setInput(inputKey, this.params[inputKey].value.length - 1);
            },
            deleteArrayElement: function (inputKey, positionKey) {
                this.$emit('onDeleteArrayElement', inputKey, positionKey);
            },
            deleteKey: function (inputKey) {
                this.$emit('onDeleteKey', inputKey);
            },
            restoreKey: function (inputKey) {
                this.$emit('onRestoreKey', inputKey);
            }
        }
    }
</script>