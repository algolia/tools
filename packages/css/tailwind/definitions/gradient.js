const _ = require('lodash')

module.exports = function({ gradients, variants }) {
  return function({ addUtilities, e }) {
    const utilities = _.map(
      gradients,
      ([start, end, startPercentage = '', endPercentage = ''], name) => ({
        [`.bg-gradient-${e(name)}`]: {
          backgroundImage: `linear-gradient(to bottom, ${start}, ${end})`
        },
        [`.bg-x-gradient-${e(name)}${startPercentage
          ? `-${startPercentage.replace('%', '')}`
          : ''}${endPercentage ? `-${endPercentage.replace('%', '')}` : ''}`]: {
          backgroundImage: `linear-gradient(to right, ${start} ${startPercentage}, ${end} ${endPercentage})`
        }
      })
    )

    addUtilities(utilities, variants)
  }
}
