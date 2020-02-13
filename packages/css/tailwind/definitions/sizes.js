const spacingUnit = 4
const variations = 240
const generatedSizes = {}
const generatedPercentSizes = {}

for (let i = 1; i <= variations; i++) {
    const size = i * spacingUnit
    generatedSizes[size] = `${size}px`
    generatedSizes[`-${size}`] = `-${size}px`
}

for (let i = 5; i <= 100; i += 5) {
    generatedPercentSizes[`${i}p`] = `${i}%`;
}

module.exports = {
    all: Object.assign(
        {
            auto: 'auto',
            px: '1px',
            '0': '0',
            '0p': '0%',
            '1': '1px',
            '2': '2px',
            '4': '4px',
            '-px': '1px',
            '-1': '-1px',
            '-2': '-2px',
            '-4': '-4px',
            half: '50%',
            third: '33.3333%',
            'two-third': '66.6666%',
            full: '100%'
        },
        generatedSizes,
        generatedPercentSizes,
    ),
    generated: Object.assign({}, generatedSizes, generatedPercentSizes),
}
