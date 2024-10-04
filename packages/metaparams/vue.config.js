const path = require("path");

module.exports = {
    publicPath: "metaparams",
    chainWebpack: (config) => {
        // Configure SVG handling
        const svgRule = config.module.rule("svg");
        svgRule.uses.clear();
        svgRule.use("vue-svg-loader").loader("vue-svg-loader");

        // ESLint configuration
        config.module
            .rule("eslint")
            .use("eslint-loader")
            .tap((options) => {
                options = options || {};
                options.configFile = path.resolve(__dirname, "../../.eslintrc");
                return options;
            });

        // YAML loader
        config.module
            .rule("yml")
            .test(/\.ya?ml$/)
            .use("js-yaml-loader")
            .loader("js-yaml-loader");

        // Webpack alias configuration
        config.resolve.alias.set("@", path.resolve(__dirname, "src")); // Change this to your folder path
    },
};
