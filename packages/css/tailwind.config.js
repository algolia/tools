const path = require("path");
const sizes = require("./definitions/sizes");
const brandColors = require("./definitions/brand-colors");
const opacityColors = require("./definitions/opacity-colors");
const languageColors = require("./definitions/language-colors");
const shiftColor = require("./definitions/shift-color");

const colors = Object.assign(
    {},
    {
        "color-inherit": "inherit",
        transparent: "transparent",
        white: "#ffffff",
        ...brandColors,
    },
    opacityColors(brandColors)
);

module.exports = {
    content: [
        path.resolve(__dirname, "../**/src/**/*.vue"),
        path.resolve(__dirname, "../**/public/index.html"),
    ],

    theme: {
        extend: {
            colors: colors,
            screens: require("./definitions/breakpoints"),
            fontFamily: {
                inherit: "inherit",
                sans: [
                    "Roboto",
                    "system-ui",
                    "BlinkMacSystemFont",
                    "-apple-system",
                    "Segoe UI",
                    "Oxygen",
                    "Ubuntu",
                    "Cantarell",
                    "Fira Sans",
                    "Droid Sans",
                    "Helvetica Neue",
                    "sans-serif",
                ],
                "sans-alt": [
                    "Hind",
                    "system-ui",
                    "BlinkMacSystemFont",
                    "-apple-system",
                    "Segoe UI",
                    "Roboto",
                    "Oxygen",
                    "Ubuntu",
                    "Cantarell",
                    "Fira Sans",
                    "Droid Sans",
                    "Helvetica Neue",
                    "sans-serif",
                ],
                mono: ["Menlo", "Courier", "monospace"],
            },
            fontWeight: {
                hairline: 100,
                thin: 200,
                light: 300,
                normal: 400,
                medium: 500,
                semibold: 600,
                bold: 700,
                extrabold: 800,
                black: 900,
            },
            fontSize: {
                inherit: "inherit",
                xxs: "9px",
                xs: "10px",
                sm: "12px",
                base: "14px",
                lg: "16px",
                xl: "18px",
                "2xl": "20px",
                "3xl": "24px",
                "4xl": "30px",
                "5xl": "36px",
                smaller: "90%",
            },
            lineHeight: {
                normalized: "normal",
                none: 1,
                tight: "16px",
                normal: "24px",
                loose: "32px",
                tall: "48px",
            },
            letterSpacing: {
                tight: "-0.5px",
                normal: "0",
                wide: "1.5px",
            },
            textColor: Object.assign({}, colors, languageColors),
            backgroundColor: Object.assign({}, colors, languageColors),
            backgroundSize: {
                auto: "auto",
                cover: "cover",
                contain: "contain",
                "height-fit": "auto 100%",
            },
            borderWidth: {
                default: "1px",
                0: "0",
                2: "2px",
                4: "4px",
                8: "8px",
            },
            borderColor: Object.assign(
                { default: colors["nebula-blue"] },
                colors
            ),
            borderRadius: {
                none: "0",
                sm: "2px",
                default: "4px",
                lg: "8px",
                full: "9999px",
            },
            width: Object.assign({}, sizes.all, {
                screen: "100vw",
                inherit: "inherit",
            }),
            height: Object.assign({}, sizes.all, { screen: "100vh" }),
            minWidth: Object.assign({}, sizes.all),
            minHeight: Object.assign({}, sizes.all, { screen: "100vh" }),
            maxWidth: Object.assign({}, sizes.all, { screen: "100vw" }),
            maxHeight: Object.assign({}, sizes.all, { screen: "100vh" }),
            padding: Object.assign({}, sizes.all),
            margin: Object.assign({}, sizes.all),
            boxShadow: {
                default:
                    "0 4px 11px 0 rgba(37, 44, 97, 0.15), 0 1px 3px 0 rgba(93, 100, 148, 0.2)",
                sm: "0 2px 2px 0 rgba(35, 37, 51, 0.1)",
                md: "0 8px 22px 0 rgba(37, 44, 97, 0.15), 0 4px 6px 0 rgba(93, 100, 148, 0.2)",
                "lg-inner": "inset 0 40px 160px 0 rgba(33, 35, 61, 0.1)",
                "lg-outer": "0 2px 64px 0 rgba(0, 0, 0, 0.15)",
                inner: "inset 0 2px 4px 0 rgba(0,0,0,0.06)",
                none: "none",
            },
            zIndex: {
                auto: "auto",
                0: 0,
                10: 10,
                20: 20,
                30: 30,
                40: 40,
                50: 50,
                60: 60,
            },
            fill: {
                current: "currentColor",
            },
            stroke: {
                current: "currentColor",
            },
        },
    },

    plugins: [
        require("./definitions/gradient")({
            gradients: {
                none: ["transparent", "transparent"],
                "white-moon-grey": [colors["white"], colors["moon-grey"]],
                "dark-nebula-blue": [
                    colors["nebula-blue"],
                    shiftColor(colors["nebula-blue"], -50),
                ],
                "light-nebula-blue": [
                    shiftColor(colors["nebula-blue"], 50),
                    colors["nebula-blue"],
                ],
                "moon-grey-proton-grey": [
                    colors["moon-grey"],
                    shiftColor(colors["moon-grey"], -10),
                    "80%",
                ],
                "mars-2-mars-1": [colors["mars-2"], colors["mars-1"]],
            },
            variants: ["responsive", "hover"],
        }),
        require("./definitions/caret")({ colors }),
        require("./definitions/columns")({
            sizes: {
                1: "1",
                2: "2",
            },
            variants: ["responsive"],
        }),
        require("./definitions/text-indent")({
            sizes: sizes.generated,
        }),
        require("./definitions/shift")({
            sizes: sizes.all,
            variants: ["responsive", "group-hover"],
        }),
        function ({ addUtilities }) {
            addUtilities({
                ".rotate-90": {
                    transform: "rotate(90deg)",
                },
                ".rotate-180": {
                    transform: "rotate(180deg)",
                },
                ".rotate-270": {
                    transform: "rotate(270deg)",
                },
                ".transition-fast-in-out": {
                    transition: "all 0.2s ease-in-out",
                },
                ".transition-slow-in-out": {
                    transition: "all 0.4s ease-in-out",
                },
                ".transition-fast-in": {
                    transition: "all 0.2s ease-in",
                },
                ".transition-slow-in": {
                    transition: "all 0.4s ease-in",
                },
                ".transition-fast-out": {
                    transition: "all 0.2s ease-out",
                },
                ".transition-slow-out": {
                    transition: "all 0.4s ease-out",
                },
                ".break-avoid-column": {
                    "break-inside": "avoid-column",
                },
                ".hyphenated": {
                    hyphens: "auto",
                },
            });
        },
        function ({ addVariant }) {
            addVariant("last-child", ({ modifySelectors, separator }) => {
                modifySelectors(({ className }) => {
                    return `.last-child${separator}${className}:last-child`;
                });
            });
        },
    ],
    variants: {
        extend: {
            backgroundColor: ["responsive", "hover", "focus"],
            borderColor: ["responsive", "hover", "focus"],
            boxShadow: ["responsive", "hover", "focus", "group-hover"],
            textColor: ["responsive", "hover", "focus", "group-hover"],
        },
    },
    corePlugins: {
        container: false, // Disable container if not needed
    },
};
