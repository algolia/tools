<template>
    <div class="text-nova-grey bg-moon-grey-opacity-50 border border-proton-grey-opacity-30">
        <div
            :id="id"
            :style="styles"
            class=""
        />
    </div>
</template>

<script>
    import ace from 'brace';
    import brace from 'brace';
    import 'brace/mode/json';
    import 'brace/theme/chrome';

    export default {
        name: 'AceEditor',
        props: ['id', 'styles', 'onChange', 'onValidate', 'defaultValue'],
        mounted: function () {
            this.editor = ace.edit(this.id);

            this.editor.getSession().on('changeAnnotation', () => {
                const annotations = this.editor.getSession().getAnnotations();
                this.$props.onValidate(annotations);
            });

            this.editor['$blockScrolling'] = true;
            this.editor.getSession().setMode('ace/mode/json');
            this.editor.setTheme('ace/theme/chrome');
            this.editor.setFontSize(12);
            this.editor.getSession().setValue(JSON.parse(JSON.stringify(this.defaultValue)), 0);
            this.editor.navigateFileEnd();
            this.editor.renderer.setShowGutter(true);
            this.editor.getSession().setUseWrapMode(true);
            this.editor.setShowPrintMargin(true);
            this.editor.on('change', () => {
                this.onChange(this.editor.getValue());
            });
        },
    }
</script>

<style>
    .ace_editor.ace-chrome {
        background-color: inherit;
        color: inherit;
    }
</style>
