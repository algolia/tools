const path = require("path");

module.exports = {
    root: true,
    parser: "vue-eslint-parser",
    parserOptions: {
        parser: "@babel/eslint-parser",
        requireConfigFile: true,
        babelOptions: {
            configFile: path.resolve(__dirname, "./babel.config.js"), // Adjust the path as necessary
        },
        ecmaVersion: 2020,
        sourceType: "module",
        ecmaFeatures: {
            jsx: true,
        },
    },
    env: {
        browser: true,
        node: true,
        es6: true,
    },
    extends: ["plugin:vue/recommended", "eslint:recommended"],
    plugins: ["vue"],
    rules: {},
};
