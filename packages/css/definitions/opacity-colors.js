const hexToRgb = require('./hex-to-rgb')

module.exports = colors => {
  const destinationColors = {}
  Object.entries(colors).forEach(color => {
    for (let i = 0; i < 10; i++) {
      const opacity = i * 10
      destinationColors[`${color[0]}-opacity-${opacity}`] = hexToRgb(
        color[1],
        opacity
      )
    }
  })
  return destinationColors
}
