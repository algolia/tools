const path = require('path');

module.exports = {
    publicPath: 'dictionaries',
    chainWebpack: config => {
        const svgRule = config.module.rule("svg");
        svgRule.uses.clear();
        svgRule.use("vue-svg-loader").loader("vue-svg-loader");

        config.module
            .rule('eslint')
            .use('eslint-loader')
            .tap(options => {
                options = options || {},
                    options.configFile = path.resolve(__dirname, "../../.eslintrc");
                return options;
            });

        config.module
            .rule("yml")
            .test(/\.ya?ml$/)
            .use("js-yaml-loader")
            .loader("js-yaml-loader");

        config.resolve.extensions.add(".ts").add(".tsx").add(".js");

        config.module
            .rule('ts')
            .test(/\.tsx?$/)
            .use('ts-loader')
            .loader('ts-loader');
    },
};


/*module.exports = {
    resolve: {
        alias: {
            "@": require("path").resolve(__dirname, "src") // change this to your folder path
        },
        extensions: [".ts", ".tsx", ".js"]
    },
    module: {
        rules: [
            // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
            { test: /\.tsx?$/, loader: "ts-loader" }
        ]
    }
};*/