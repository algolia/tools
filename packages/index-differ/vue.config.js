module.exports = {
    publicPath: process.env.NODE_ENV === "production" ? "/index-differ/" : "/",
    chainWebpack: (config) => {
        // Configure SVG handling
        const svgRule = config.module.rule("svg");
        svgRule.uses.clear();
        svgRule.use("vue-svg-loader").loader("vue-svg-loader");

        // YAML loader
        config.module
            .rule("yaml")
            .test(/\.ya?ml$/)
            .use("yaml-loader")
            .loader("yaml-loader");

        config.resolve.extensions.add(".ts").add(".tsx").add(".js");

        config.module
            .rule("ts")
            .test(/\.tsx?$/)
            .use("ts-loader")
            .loader("ts-loader");
    },
};
