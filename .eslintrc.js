module.exports = {
    root: true,
    env: {
        node: true,
    },
    extends: ["plugin:vue/recommended", "eslint:recommended"],
    plugins: ["vue"],
    rules: {
        "vue/multi-word-component-names": "off",
        "vue/valid-next-tick": "off",
    },
};
