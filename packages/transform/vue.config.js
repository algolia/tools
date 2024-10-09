const MonacoEditorPlugin = require("monaco-editor-webpack-plugin");
const path = require("path");

module.exports = {
    publicPath: process.env.NODE_ENV === "production" ? "/transform/" : "/",
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
