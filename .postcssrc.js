const tailwindcss = require('tailwindcss');
const tailwindConfig = require('common/tailwind');

module.exports = ({ file, options, env }) => {
  const baseConfig = [
      require('@csstools/postcss-sass'),
      tailwindcss(tailwindConfig),
      require('autoprefixer')(),
  ]
  const prodConfig = [
      require('postcss-clean'),
      require('@fullhuman/postcss-purgecss')({
        content: ['../**/*.vue'],
        extractors: [
            {
                extractor: (content) => {
                    return content.match(/[A-z0-9-:\/]+/g) || []
                },
                extensions: ['vue', 'html']
            }
        ],
        whitelistPatterns: [/html/, /body/,/ais-.*/, /em/, /token/, /language/, /d2h-.*/, /w-40/, /w-80/, /w-120/, /w-160/, /h-40/, /h-80/, /h-120/, /h-160/],
        whitelistPatternsChildren: [/filter/, /token/, /Token.*/, /token.*/],
    })
  ]
  return {
    plugins: [...baseConfig, ...(env === 'production' ? prodConfig : [])],
  }
}

