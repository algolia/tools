const tailwindcss = require('tailwindcss');
const tailwindConfig = require('common/tailwind');

module.exports = ({file, options, env}) => {
    const baseConfig = [
        tailwindcss(tailwindConfig),
        require('autoprefixer')(),
    ];

    const prodConfig = [
        require('@fullhuman/postcss-purgecss')({
            content: ['./src/**/*.vue', '../common/**/*.vue'],
            extractors: [
                {
                    extractor: class {
                        static extract(content) {
                            return content.match(/[A-z0-9-:\/]+/g) || []
                        }
                    },
                    extensions: ['vue', 'html']
                }
            ],
            whitelistPatterns: [/body/, /ais-.*/, /em/, /token/, /language/, /w-40/, /w-80/, /w-120/, /w-160/, /h-40/, /h-80/, /h-120/, /h-160/],
            whitelistPatternsChildren: [/filter.*/, /token.*/],
        })
    ]
    return {
        plugins: [...baseConfig, ...(env === 'production' ? prodConfig : [])],
    }
}
