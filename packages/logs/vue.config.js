const path = require("path");
module.exports = {
    publicPath: process.env.NODE_ENV === "production" ? "/logs/" : "/",
    chainWebpack: (config) => {
        const commonPath = path.resolve(__dirname, "../common"); // Adjust this path as needed
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
    },
};
