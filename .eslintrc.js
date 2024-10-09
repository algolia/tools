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
        "vue/require-v-for-key": "off",
        "vue/no-unused-components": "off",
        "vue/return-in-computed-property": "off",
        "vue/no-mutating-props": "off",
        "no-unused-vars": "off",
        "vue/no-parsing-error": "off",
        "vue/no-use-v-if-with-v-for": "off",
        "no-empty": "off",
        "vue/no-unused-vars": "off",
    },
};
