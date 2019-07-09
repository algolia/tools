const _ = require('lodash')

module.exports = function({ sizes, variants }) {
  return function({ addUtilities }) {
    const utilities = _.map(sizes, (size, name) => ({
      [`.shift-x-${name}`]: {
        transform: `translateX(${size})`
      },
      [`.shift-y-${name}`]: {
        transform: `scaleY(${size})`
      }
    }))
    addUtilities(utilities, variants)
  }
}
