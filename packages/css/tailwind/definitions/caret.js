const _ = require('lodash')

module.exports = function({ colors, variants }) {
  return function({ addUtilities, e }) {
    const utilities = _.map(colors, (color, name) => ({
      [`.caret-color-${e(name)}`]: {
        caretColor: color
      }
    }))

    addUtilities(utilities, variants)
  }
}
