const MonacoEditorPlugin = require("monaco-editor-webpack-plugin");

module.exports = {
    publicPath: "index-analyzer",
    chainWebpack: (config) => {
        const svgRule = config.module.rule("svg");
        svgRule.uses.clear();
        svgRule.use("vue-svg-loader").loader("vue-svg-loader");

        config.module
            .rule("yaml")
            .test(/\.ya?ml$/)
            .use("yaml-loader")
            .loader("yaml-loader");

        config.plugin("MonacoEditorPlugin").use(
            new MonacoEditorPlugin({
                languages: ["javascript", "typescript"],
            })
        );
    },
};
