const setChannel = channel => (channel > 255 ? 255 : channel < 0 ? 0 : channel)

module.exports = (hex = '', value = 0) => {
  const num = parseInt(hex.replace('#', ''), 16)

  const r = setChannel((num >> 16) + value)
  const b = setChannel(((num >> 8) & 0x00ff) + value)
  const g = setChannel((num & 0x0000ff) + value)

  return `#${(g | (b << 8) | (r << 16)).toString(16)}`
}
