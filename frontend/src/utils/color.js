export const hexToRGBArray = (color) => {
    color = color.toUpperCase()
    if (/^#[0-9A-F]{6}$/.test(color)) {
        const [, ...components] = color.match(/([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})/)
        return components.map((component) => parseInt(component, 16))
    } if (/^rgb\(([\d]{1,3}),([\d]{1,3}),([\d]{1,3})\)$/.test(color)) {
        const [, ...components] = color.match(/([\d]{1,3}),([\d]{1,3}),([\d]{1,3})/)
        return components.map((component) => parseInt(component, 16))
    }

    throw new Error(`${color} is not RGB like`)
}

export const luma = (color) => {
    const rgb = hexToRGBArray(color)
    return (0.2126 * rgb[0]) + (0.7152 * rgb[1]) + (0.0722 * rgb[2])
}

export const darker = (color) => {
    // eslint-disable-next-line no-bitwise
    const rgb = hexToRGBArray(color).map((component) => (component & 0xfefefe) >> 1)
    return `rgb(${rgb.join(',')})`
}
