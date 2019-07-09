module.exports = (hex = '', opacity = 100) => {
  const cleanHex = hex.replace('#', '')
  return `rgba(${parseInt(cleanHex.substring(0, 2), 16)}, ${parseInt(
    cleanHex.substring(2, 4),
    16
  )}, ${parseInt(cleanHex.substring(4, 6), 16)}, ${opacity / 100})`
}
