const _ = require('lodash')

module.exports = function({ sizes, variants }) {
  return function({ addUtilities }) {
    const utilities = _.map(sizes, (size, name) => ({
      [`.column-${name}`]: {
        columnCount: size,
        columnGap: 0
      }
    }))
    addUtilities(utilities, variants)
  }
}
