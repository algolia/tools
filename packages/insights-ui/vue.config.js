module.exports = {
    publicPath: process.env.NODE_ENV === "production" ? "/insights-ui/" : "/",
    chainWebpack: (config) => {
        const svgRule = config.module.rule("svg");
        svgRule.uses.clear();
        svgRule.use("vue-svg-loader").loader("vue-svg-loader");

        config.module
            .rule("yaml")
            .test(/\.ya?ml$/)
            .use("yaml-loader")
            .loader("yaml-loader");
    },
};
