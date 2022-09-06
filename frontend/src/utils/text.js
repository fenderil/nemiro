import { MAX_STICKER_WIDTH } from '../constants'
import { state } from '../state'

const substringSymbol = (delta) => (string, index, replacement) => `${
    string.substring(0, index)
}${
    replacement
}${
    string.substring(index + delta)
}`

export const insertSymbol = substringSymbol(0)
export const replaceSymbol = substringSymbol(1)

export const getStringWidth = (string) => state.canvasContext.measureText(string).width || 0

export const createMultilineText = (text = '', maxWidth = MAX_STICKER_WIDTH) => {
    let tempText = ''

    text.split('').forEach((symbol) => {
        tempText += symbol
        const lines = tempText.split(/[\r\n]/)
        const lastLine = lines[lines.length - 1]
        const lastLineWidth = getStringWidth(lastLine)

        if (lastLineWidth > maxWidth) {
            if (lastLine.includes(' ')) {
                tempText = replaceSymbol(tempText, tempText.lastIndexOf(' '), '\r')
            } else {
                tempText = insertSymbol(tempText, tempText.length - 1, '\r')
            }
        }
    })

    return tempText
}
