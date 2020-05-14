<template>
    <div></div>
</template>

<script>
    const monaco = require('monaco-editor');

    export default {
        name: 'MonacoEditor',
        props: ['value', 'language'],
        watch: {
            value(newValue) {
                if (this.editor) {
                    const editor = this.editor;
                    if (newValue !== editor.getValue()) {
                        editor.setValue(newValue)
                    }
                }
            },
            theme(newVal) {
                if (this.editor) {
                    this.monaco.editor.setTheme(newVal)
                }
            }
        },
        mounted: function () {
            const options = {
                minimap: {
                    enabled: false
                },
                value: this.value,
                theme: 'vs-dark',
                language: this.language,
                wordWrap: 'on',
            };

            this.editor = monaco.editor.create(this.$el, options);


            this.editor.onDidChangeModelContent(event => {
                const value = this.editor.getValue();
                if (this.value !== value) {
                    this.$emit('input', value, event)
                }
            });

            const KM = monaco.KeyMod;
            const KC = monaco.KeyCode;
            this.editor.addCommand(KM.chord(KM.CtrlCmd | KC.KEY_S), () => {
                this.$emit('onShouldSave');
            });
        },
        beforeDestroy() {
            this.editor && this.editor.dispose()
        },
    }
</script>
