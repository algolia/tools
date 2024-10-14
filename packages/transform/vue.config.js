const MonacoEditorPlugin = require("monaco-editor-webpack-plugin");
const path = require("path");

module.exports = {
    publicPath: process.env.NODE_ENV === "production" ? "/transform/" : "/",
    chainWebpack: (config) => {
        const commonPath = path.resolve(__dirname, "../common");
        config.module
            .rule("svg")
            .exclude.add(path.resolve(commonPath, "icons"))
            .end();

        // Add a new rule for SVGs in `common/icons` to use `vue-svg-loader`
        config.module
            .rule("svg-common")
            .test(/\.svg$/)
            .include.add(path.resolve(commonPath, "icons"))
            .end()
            .use("vue-svg-loader")
            .loader("vue-svg-loader");

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
