const _ = require('lodash')

module.exports = function({ sizes, variants }) {
  return function({ addUtilities }) {
    const utilities = _.map(sizes, (size, name) => ({
      [`.text-indent-${name}`]: {
        textIndent: size
      }
    }))
    addUtilities(utilities, variants)
  }
}
