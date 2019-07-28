/*

Tailwind - The Utility-First CSS Framework

A project by Adam Wathan (@adamwathan), Jonathan Reinink (@reinink),
David Hemphill (@davidhemphill) and Steve Schoger (@steveschoger).

Welcome to the Tailwind config file. This is where you can customize
Tailwind specifically for your project. Don't be intimidated by the
length of this file. It's really just a big JavaScript object and
we've done our very best to explain each section.

View the full documentation at https://tailwindcss.com.


|-------------------------------------------------------------------------------
| The default config
|-------------------------------------------------------------------------------
|
| This variable contains the default Tailwind config. You don't have
| to use it, but it can sometimes be helpful to have available. For
| example, you may choose to merge your custom configuration
| values with some of the Tailwind defaults.
|
*/

const sizes = require('./definitions/sizes');
const brandColors = require('./definitions/brand-colors');
const opacityColors = require('./definitions/opacity-colors');
const languageColors = require('./definitions/language-colors');
const shiftColor = require('./definitions/shift-color');

/*
|-------------------------------------------------------------------------------
| Colors                                    https://tailwindcss.com/docs/colors
|-------------------------------------------------------------------------------
|
| Here you can specify the colors used in your project. To get you started,
| we've provided a generous palette of great looking colors that are perfect
| for prototyping, but don't hesitate to change them for your project. You
| own these colors, nothing will break if you change everything about them.
|
| We've used literal color names ("red", "blue", etc.) for the default
| palette, but if you'd rather use functional names like "primary" and
| "secondary", or even a numeric scale like "100" and "200", go for it.
|
*/

const colors = Object.assign(
    {},
    {
        'color-inherit': 'inherit',
        transparent: 'transparent',
        white: '#ffffff',
        ...brandColors
    },
    opacityColors(brandColors)
);

module.exports = {
    theme: {
        /*
        |-----------------------------------------------------------------------------
        | Colors                                  https://tailwindcss.com/docs/colors
        |-----------------------------------------------------------------------------
        |
        | The color palette defined above is also assigned to the "colors" key of
        | your Tailwind config. This makes it easy to access them in your CSS
        | using Tailwind's config helper. For example:
        |
        | .error { color: config('colors.red') }
        |
        */

        extend: {
            colors: colors,
        },

        /*
        |-----------------------------------------------------------------------------
        | Screens                      https://tailwindcss.com/docs/responsive-design
        |-----------------------------------------------------------------------------
        |
        | Screens in Tailwind are translated to CSS media queries. They define the
        | responsive breakpoints for your project. By default Tailwind takes a
        | "mobile first" approach, where each screen size represents a minimum
        | viewport width. Feel free to have as few or as many screens as you
        | want, naming them in whatever way you'd prefer for your project.
        |
        | Tailwind also allows for more complex screen definitions, which can be
        | useful in certain situations. Be sure to see the full responsive
        | documentation for a complete list of options.
        |
        | Class name: .{screen}:{utility}
        |
        */

        screens: require('./definitions/breakpoints'),

        /*
        |-----------------------------------------------------------------------------
        | Fonts                                    https://tailwindcss.com/docs/fonts
        |-----------------------------------------------------------------------------
        |
        | Here is where you define your project's font stack, or font families.
        | Keep in mind that Tailwind doesn't actually load any fonts for you.
        | If you're using custom fonts you'll need to import them prior to
        | defining them here.
        |
        | By default we provide a native font stack that works remarkably well on
        | any device or OS you're using, since it just uses the default fonts
        | provided by the platform.
        |
        | Class name: .font-{name}
        |
        */

        fontFamily: {
            inherit: 'inherit',
            sans: [
                'Roboto',
                'system-ui',
                'BlinkMacSystemFont',
                '-apple-system',
                'Segoe UI',
                'Oxygen',
                'Ubuntu',
                'Cantarell',
                'Fira Sans',
                'Droid Sans',
                'Helvetica Neue',
                'sans-serif'
            ],
            'sans-alt': [
                'Hind',
                'system-ui',
                'BlinkMacSystemFont',
                '-apple-system',
                'Segoe UI',
                'Roboto',
                'Oxygen',
                'Ubuntu',
                'Cantarell',
                'Fira Sans',
                'Droid Sans',
                'Helvetica Neue',
                'sans-serif'
            ],
            mono: ['Menlo', 'Courier', 'monospace']
        },

        /*
        |-----------------------------------------------------------------------------
        | Text sizes                         https://tailwindcss.com/docs/text-sizing
        |-----------------------------------------------------------------------------
        |
        | Here is where you define your text sizes. Name these in whatever way
        | makes the most sense to you. We use size names by default, but
        | you're welcome to use a numeric scale or even something else
        | entirely.
        |
        | By default Tailwind uses the "rem" unit type for most measurements.
        | This allows you to set a root font size which all other sizes are
        | then based on. That said, you are free to use whatever units you
        | prefer, be it rems, ems, pixels or other.
        |
        | Class name: .text-{size}
        |
        */

        fontSize: {
            inherit: 'inherit',
            xxs: '9px',
            xs: '10px',
            sm: '12px',
            base: '14px',
            lg: '16px',
            xl: '18px',
            '2xl': '20px',
            '3xl': '24px',
            '4xl': '30px',
            '5xl': '36px',
            smaller: '90%'
        },

        /*
        |-----------------------------------------------------------------------------
        | Font weights                       https://tailwindcss.com/docs/font-weight
        |-----------------------------------------------------------------------------
        |
        | Here is where you define your font weights. We've provided a list of
        | common font weight names with their respective numeric scale values
        | to get you started. It's unlikely that your project will require
        | all of these, so we recommend removing those you don't need.
        |
        | Class name: .font-{weight}
        |
        */

        fontWeight: {
            hairline: 100,
            thin: 200,
            light: 300,
            normal: 400,
            medium: 500,
            semibold: 600,
            bold: 700,
            extrabold: 800,
            black: 900
        },

        /*
        |-----------------------------------------------------------------------------
        | Leading (line height)              https://tailwindcss.com/docs/line-height
        |-----------------------------------------------------------------------------
        |
        | Here is where you define your line height values, or as we call
        | them in Tailwind, leadings.
        |
        | Class name: .leading-{size}
        |
        */

        lineHeight: {
            normalized: 'normal',
            none: 1,
            tight: '16px',
            normal: '24px',
            loose: '32px',
            tall: '48px'
        },

        /*
        |-----------------------------------------------------------------------------
        | Tracking (letter spacing)       https://tailwindcss.com/docs/letter-spacing
        |-----------------------------------------------------------------------------
        |
        | Here is where you define your letter spacing values, or as we call
        | them in Tailwind, tracking.
        |
        | Class name: .tracking-{size}
        |
        */

        letterSpacing: {
            tight: '-0.5px',
            normal: '0',
            wide: '1.5px'
        },

        /*
        |-----------------------------------------------------------------------------
        | Text colors                         https://tailwindcss.com/docs/text-color
        |-----------------------------------------------------------------------------
        |
        | Here is where you define your text colors. By default these use the
        | color palette we defined above, however you're welcome to set these
        | independently if that makes sense for your project.
        |
        | Class name: .text-{color}
        |
        */

        textColor: Object.assign({}, colors, languageColors),

        /*
        |-----------------------------------------------------------------------------
        | Background colors             https://tailwindcss.com/docs/background-color
        |-----------------------------------------------------------------------------
        |
        | Here is where you define your background colors. By default these use
        | the color palette we defined above, however you're welcome to set
        | these independently if that makes sense for your project.
        |
        | Class name: .bg-{color}
        |
        */

        backgroundColor: Object.assign({}, colors, languageColors),

        /*
        |-----------------------------------------------------------------------------
        | Background sizes               https://tailwindcss.com/docs/background-size
        |-----------------------------------------------------------------------------
        |
        | Here is where you define your background sizes. We provide some common
        | values that are useful in most projects, but feel free to add other sizes
        | that are specific to your project here as well.
        |
        | Class name: .bg-{size}
        |
        */

        backgroundSize: {
            auto: 'auto',
            cover: 'cover',
            contain: 'contain',
            'height-fit': 'auto 100%'
        },

        /*
        |-----------------------------------------------------------------------------
        | Border widths                     https://tailwindcss.com/docs/border-width
        |-----------------------------------------------------------------------------
        |
        | Here is where you define your border widths. Take note that border
        | widths require a special "default" value set as well. This is the
        | width that will be used when you do not specify a border width.
        |
        | Class name: .border{-side?}{-width?}
        |
        */

        borderWidth: {
            default: '1px',
            '0': '0',
            '2': '2px',
            '4': '4px',
            '8': '8px'
        },

        /*
        |-----------------------------------------------------------------------------
        | Border colors                     https://tailwindcss.com/docs/border-color
        |-----------------------------------------------------------------------------
        |
        | Here is where you define your border colors. By default these use the
        | color palette we defined above, however you're welcome to set these
        | independently if that makes sense for your project.
        |
        | Take note that border colors require a special "default" value set
        | as well. This is the color that will be used when you do not
        | specify a border color.
        |
        | Class name: .border-{color}
        |
        */

        borderColor: global.Object.assign(
            { default: colors['nebula-blue'] },
            colors
        ),

        /*
        |-----------------------------------------------------------------------------
        | Border radius                    https://tailwindcss.com/docs/border-radius
        |-----------------------------------------------------------------------------
        |
        | Here is where you define your border radius values. If a `default` radius
        | is provided, it will be made available as the non-suffixed `.rounded`
        | utility.
        |
        | If your scale includes a `0` value to reset already rounded corners, it's
        | a good idea to put it first so other values are able to override it.
        |
        | Class name: .rounded{-side?}{-size?}
        |
        */

        borderRadius: {
            none: '0',
            sm: '2px',
            default: '4px',
            lg: '8px',
            full: '9999px'
        },

        /*
        |-----------------------------------------------------------------------------
        | Width                                    https://tailwindcss.com/docs/width
        |-----------------------------------------------------------------------------
        |
        | Here is where you define your width utility sizes. These can be
        | percentage based, pixels, rems, or any other units. By default
        | we provide a sensible rem based numeric scale, a percentage
        | based fraction scale, plus some other common use-cases. You
        | can, of course, modify these values as needed.
        |
        |
        | It's also worth mentioning that Tailwind automatically escapes
        | invalid CSS class name characters, which allows you to have
        | awesome classes like .w-2/3.
        |
        | Class name: .w-{size}
        |
        */

        width: global.Object.assign({}, sizes.all, {
            screen: '100vw',
            inherit: 'inherit'
        }),

        /*
        |-----------------------------------------------------------------------------
        | Height                                  https://tailwindcss.com/docs/height
        |-----------------------------------------------------------------------------
        |
        | Here is where you define your height utility sizes. These can be
        | percentage based, pixels, rems, or any other units. By default
        | we provide a sensible rem based numeric scale plus some other
        | common use-cases. You can, of course, modify these values as
        | needed.
        |
        | Class name: .h-{size}
        |
        */

        height: global.Object.assign({}, sizes.all, { screen: '100vh' }),

        /*
        |-----------------------------------------------------------------------------
        | Minimum width                        https://tailwindcss.com/docs/min-width
        |-----------------------------------------------------------------------------
        |
        | Here is where you define your minimum width utility sizes. These can
        | be percentage based, pixels, rems, or any other units. We provide a
        | couple common use-cases by default. You can, of course, modify
        | these values as needed.
        |
        | Class name: .min-w-{size}
        |
        */

        minWidth: global.Object.assign({}, sizes.all),

        /*
        |-----------------------------------------------------------------------------
        | Minimum height                      https://tailwindcss.com/docs/min-height
        |-----------------------------------------------------------------------------
        |
        | Here is where you define your minimum height utility sizes. These can
        | be percentage based, pixels, rems, or any other units. We provide a
        | few common use-cases by default. You can, of course, modify these
        | values as needed.
        |
        | Class name: .min-h-{size}
        |
        */

        minHeight: global.Object.assign({}, sizes.all, { screen: '100vh' }),

        /*
        |-----------------------------------------------------------------------------
        | Maximum width                        https://tailwindcss.com/docs/max-width
        |-----------------------------------------------------------------------------
        |
        | Here is where you define your maximum width utility sizes. These can
        | be percentage based, pixels, rems, or any other units. By default
        | we provide a sensible rem based scale and a "full width" size,
        | which is basically a reset utility. You can, of course,
        | modify these values as needed.
        |
        | Class name: .max-w-{size}
        |
        */

        maxWidth: global.Object.assign({}, sizes.all, { screen: '100vw' }),

        /*
        |-----------------------------------------------------------------------------
        | Maximum height                      https://tailwindcss.com/docs/max-height
        |-----------------------------------------------------------------------------
        |
        | Here is where you define your maximum height utility sizes. These can
        | be percentage based, pixels, rems, or any other units. We provide a
        | couple common use-cases by default. You can, of course, modify
        | these values as needed.
        |
        | Class name: .max-h-{size}
        |
        */

        maxHeight: global.Object.assign({}, sizes.all, {
            screen: '100vh'
        }),

        /*
        |-----------------------------------------------------------------------------
        | Padding                                https://tailwindcss.com/docs/padding
        |-----------------------------------------------------------------------------
        |
        | Here is where you define your padding utility sizes. These can be
        | percentage based, pixels, rems, or any other units. By default we
        | provide a sensible rem based numeric scale plus a couple other
        | common use-cases like "1px". You can, of course, modify these
        | values as needed.
        |
        | Class name: .p{side?}-{size}
        |
        */

        padding: global.Object.assign({}, sizes.all),

        /*
        |-----------------------------------------------------------------------------
        | Margin                                  https://tailwindcss.com/docs/margin
        |-----------------------------------------------------------------------------
        |
        | Here is where you define your margin utility sizes. These can be
        | percentage based, pixels, rems, or any other units. By default we
        | provide a sensible rem based numeric scale plus a couple other
        | common use-cases like "1px". You can, of course, modify these
        | values as needed.
        |
        | Class name: .m{side?}-{size}
        |
        */

        margin: global.Object.assign({}, sizes.all),

        /*
        |-----------------------------------------------------------------------------
        | Shadows                                https://tailwindcss.com/docs/shadows
        |-----------------------------------------------------------------------------
        |
        | Here is where you define your shadow utilities. As you can see from
        | the defaults we provide, it's possible to apply multiple shadows
        | per utility using comma separation.
        |
        | If a `default` shadow is provided, it will be made available as the non-
        | suffixed `.shadow` utility.
        |
        | Class name: .shadow-{size?}
        |
        */

        boxShadow: {
            default:
                '0 4px 11px 0 rgba(37, 44, 97, 0.15), 0 1px 3px 0 rgba(93, 100, 148, 0.2)',
            sm: '0 2px 2px 0 rgba(35, 37, 51, 0.1)',
            md:
                '0 8px 22px 0 rgba(37, 44, 97, 0.15), 0 4px 6px 0 rgba(93, 100, 148, 0.2)',
            'lg-inner': 'inset 0 40px 160px 0 rgba(33, 35, 61, 0.1)',
            'lg-outer': '0 2px 64px 0 rgba(0, 0, 0, 0.15)',
            inner: 'inset 0 2px 4px 0 rgba(0,0,0,0.06)',
            none: 'none'
        },

        /*
        |-----------------------------------------------------------------------------
        | Z-index                                https://tailwindcss.com/docs/z-index
        |-----------------------------------------------------------------------------
        |
        | Here is where you define your z-index utility values. By default we
        | provide a sensible numeric scale. You can, of course, modify these
        | values as needed.
        |
        | Class name: .z-{index}
        |
        */

        zIndex: {
            auto: 'auto',
            '0': 0,
            '10': 10,
            '20': 20,
            '30': 30,
            '40': 40,
            '50': 50,
            '60': 60
        },

        /*
        |-----------------------------------------------------------------------------
        | SVG fill                                   https://tailwindcss.com/docs/svg
        |-----------------------------------------------------------------------------
        |
        | Here is where you define your SVG fill colors. By default we just provide
        | `fill-current` which sets the fill to the current text color. This lets you
        | specify a fill color using existing text color utilities and helps keep the
        | generated CSS file size down.
        |
        | Class name: .fill-{name}
        |
        */

        fill: {
            current: 'currentColor'
        },

        /*
        |-----------------------------------------------------------------------------
        | SVG stroke                                 https://tailwindcss.com/docs/svg
        |-----------------------------------------------------------------------------
        |
        | Here is where you define your SVG stroke colors. By default we just provide
        | `stroke-current` which sets the stroke to the current text color. This lets
        | you specify a stroke color using existing text color utilities and helps
        | keep the generated CSS file size down.
        |
        | Class name: .stroke-{name}
        |
        */

        stroke: {
            current: 'currentColor'
        },
    },

    /*
    |-----------------------------------------------------------------------------
    | Modules                  https://tailwindcss.com/docs/configuration#modules
    |-----------------------------------------------------------------------------
    |
    | Here is where you control which modules are generated and what variants are
    | generated for each of those modules.
    |
    | Currently supported variants:
    |   - responsive
    |   - hover
    |   - focus
    |   - active
    |   - group-hover
    |
    | To disable a module completely, use `false` instead of an array.
    |
    */

    variants: {
        appearance: ['responsive'],
        backgroundAttachment: ['responsive'],
        backgroundColor: ['responsive', 'hover', 'focus'],
        backgroundPosition: ['responsive'],
        backgroundRepeat: ['responsive'],
        backgroundSize: ['responsive'],
        borderCollapse: [],
        borderColor: ['responsive', 'hover', 'focus'],
        borderRadius: ['responsive'],
        borderStyle: ['responsive'],
        borderWidth: ['responsive', 'last-child'],
        cursor: ['responsive'],
        display: ['responsive', 'last-child', 'group-hover'],
        flexDirection: ['responsive', 'group-hover'],
        flexWrap: ['responsive', 'group-hover'],
        alignItems: ['responsive', 'group-hover'],
        alignSelf: ['responsive', 'group-hover'],
        justifyContent: ['responsive', 'group-hover'],
        alignContent: ['responsive', 'group-hover'],
        flex: ['responsive', 'group-hover'],
        flexGrow: ['responsive', 'group-hover'],
        flexShrink: ['responsive', 'group-hover'],
        float: ['responsive'],
        fontFamily: ['responsive'],
        fontWeight: ['responsive', 'hover', 'focus'],
        height: ['responsive'],
        lineHeight: ['responsive'],
        listStylePosition: ['responsive'],
        listStyleType: ['responsive'],
        margin: ['responsive'],
        maxHeight: ['responsive'],
        maxWidth: ['responsive'],
        minHeight: ['responsive'],
        minWidth: ['responsive'],
        opacity: ['responsive', 'hover', 'group-hover'],
        outline: ['focus'],
        overflow: ['responsive', 'hover'],
        padding: ['responsive'],
        pointerEvents: ['responsive'],
        position: ['responsive'],
        inset: ['responsive'],
        resize: ['responsive'],
        shadow: ['responsive', 'hover', 'focus', 'group-hover'],
        fill: [],
        stroke: [],
        tableLayout: ['responsive'],
        textAlign: ['responsive'],
        textColor: ['responsive', 'hover', 'focus', 'group-hover'],
        fontSize: ['responsive'],
        fontStyle: ['responsive', 'hover', 'focus'],
        fontSmoothing: ['responsive', 'hover', 'focus'],
        textDecoration: ['responsive', 'hover', 'focus'],
        textTransform: ['responsive', 'hover', 'focus'],
        letterSpacing: ['responsive'],
        userSelect: ['responsive'],
        verticalAlign: ['responsive'],
        visibility: ['responsive', 'group-hover'],
        whitespace: ['responsive'],
        wordBreak: ['responsive'],
        width: ['responsive'],
        zIndex: ['responsive']
    },

    corePlugins: {
        container: false
    },

    /*
    |-----------------------------------------------------------------------------
    | Plugins                                https://tailwindcss.com/docs/plugins
    |-----------------------------------------------------------------------------
    |
    | Here is where you can register any plugins you'd like to use in your
    | project. Tailwind's built-in `container` plugin is enabled by default to
    | give you a Bootstrap-style responsive container component out of the box.
    |
    | Be sure to view the complete plugin documentation to learn more about how
    | the plugin system works.
    |
    */

    plugins: [
        require('./definitions/gradient')({
            gradients: {
                none: ['transparent', 'transparent'],
                'white-moon-grey': [colors['white'], colors['moon-grey']],
                'dark-nebula-blue': [
                    colors['nebula-blue'],
                    shiftColor(colors['nebula-blue'], -50)
                ],
                'light-nebula-blue': [
                    shiftColor(colors['nebula-blue'], 50),
                    colors['nebula-blue']
                ],
                'moon-grey-proton-grey': [
                    colors['moon-grey'],
                    shiftColor(colors['moon-grey'], -10),
                    '80%'
                ],
                'mars-2-mars-1': [
                    colors['mars-2'],
                    colors['mars-1']
                ]
            },
            variants: ['responsive', 'hover']
        }),
        require('./definitions/caret')({ colors }),
        require('./definitions/columns')({
            sizes: {
                1: '1',
                2: '2'
            },
            variants: ['responsive']
        }),
        require('./definitions/text-indent')({
            sizes: sizes.generated
        }),
        require('./definitions/shift')({
            sizes: sizes.all,
            variants: ['responsive', 'group-hover']
        }),
        function({ addUtilities }) {
            addUtilities({
                '.rotate-90': {
                    transform: 'rotate(90deg)'
                },
                '.rotate-180': {
                    transform: 'rotate(180deg)'
                },
                '.rotate-270': {
                    transform: 'rotate(270deg)'
                },
                '.transition-fast-in-out': {
                    transition: 'all 0.2s ease-in-out'
                },
                '.transition-slow-in-out': {
                    transition: 'all 0.4s ease-in-out'
                },
                '.transition-fast-in': {
                    transition: 'all 0.2s ease-in'
                },
                '.transition-slow-in': {
                    transition: 'all 0.4s ease-in'
                },
                '.transition-fast-out': {
                    transition: 'all 0.2s ease-out'
                },
                '.transition-slow-out': {
                    transition: 'all 0.4s ease-out'
                },
                '.break-avoid-column': {
                    'break-inside': 'avoid-column'
                },
                '.hyphenated': {
                    hyphens: 'auto'
                },
            })
        },
        function({ addVariant }) {
            addVariant('last-child', ({ modifySelectors, separator }) => {
                modifySelectors(({ className }) => {
                    return `.last-child${separator}${className}:last-child`
                })
            })
        }
    ],
};
