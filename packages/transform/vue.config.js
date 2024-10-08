const MonacoEditorPlugin = require("monaco-editor-webpack-plugin");
const path = require("path");

module.exports = {
    publicPath: "transform",
    chainWebpack: (config) => {
        const svgRule = config.module.rule("svg");
        svgRule.uses.clear();
        svgRule.use("vue-svg-loader").loader("vue-svg-loader");

        config.module
            .rule("eslint")
            .use("eslint-loader")
            .tap((options) => {
                (options = options || {}),
                    (options.configFile = path.resolve(
                        __dirname,
                        "../../.eslintrc"
                    ));
                return options;
            });

        config.module
            .rule("yml")
            .test(/\.ya?ml$/)
            .use("js-yaml-loader")
            .loader("js-yaml-loader");

        config.plugin("MonacoEditorPlugin").use(
            new MonacoEditorPlugin({
                languages: ["javascript", "typescript"],
            })
        );
    },
};
