const sizes = [
    '72',
    '96',
    '128',
    '144',
    '152',
    '192',
    '384',
    '512',
    '120',
    '180',
]

const fs = require('fs')
const path = require('path')

const icon = fs.readFileSync(path.resolve(process.cwd(), 'frontend', 'static', 'nemiro-logo-m.svg'), 'utf8')

sizes.forEach((size) => {
    fs.writeFileSync(
        path.resolve(process.cwd(), 'frontend', 'static', `nemiro-logo-m-${size}x${size}.svg`),
        icon
            .replace('height="144px" width="144px"', `height="${size}px" width="${size}px"`),
        'utf8',
    )
})
