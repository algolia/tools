const path = require("path");

module.exports = {
    publicPath: "logs",
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

        config.resolve.alias.set("@", path.resolve(__dirname, "src"));
    },
};
