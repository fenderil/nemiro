import { state } from '../../data/state'
import { nodes } from '../../data/nodes'
import { isTextElement, isStickerElement, isEditableElement } from '../../utils/types'
import { createMultilineText, getStringWidth } from '../../utils/text'
import { getCoordinates } from '../../utils/coords'
import { redrawScreen } from '../draw'
import { changeSelectedType } from '../../interface/controls'
import {
    CONTROL_TYPES,
    DATA_ACTIONS,
    MAX_STICKER_WIDTH,
    STRING_HEIGHT,
    STICKER_OFFSET,
} from '../../data/constants'
import './style.css'

let tempInputEditHandler = () => {}
let tempInputBlurHandler = () => {}

const stopTrackText = (element) => {
    state.sendDataUpdate({
        ...element,
        action: element.id ? DATA_ACTIONS.edit : DATA_ACTIONS.add,
    })

    nodes.tempInputElement.removeEventListener('input', tempInputEditHandler)
    nodes.canvas.removeEventListener('click', tempInputBlurHandler)
    nodes.tempInputElement.classList.add('hidden')

    state.workInProgressElements = []
}

const resize = (input, rows, offset = 0) => {
    const width = Math.max(...rows.map(getStringWidth), STRING_HEIGHT)
    const height = STRING_HEIGHT * rows.length || STRING_HEIGHT
    input.style.width = `${width}px`
    input.style.height = `${height}px`
    state.workInProgressElements[0].points[1] = [
        state.workInProgressElements[0].points[0][0] + width + offset,
        state.workInProgressElements[0].points[0][1] + height + offset,
    ]
}

export const editableText = (element) => {
    const leftOffset = element.points[0][0] * state.currentScale - nodes.board.scrollLeft
    const topOffset = element.points[0][1] * state.currentScale - nodes.board.scrollTop
    const paddingOffset = isStickerElement(element) ? STICKER_OFFSET : 0
    nodes.tempInputElement.style.left = `${leftOffset + paddingOffset / 2}px`
    nodes.tempInputElement.style.top = `${topOffset + paddingOffset / 2}px`
    nodes.tempInputElement.classList.remove('hidden')
    nodes.tempInputElement.value = element.text || ''
    nodes.tempInputElement.focus()

    let lines = createMultilineText(element.text || '', Infinity).split(/[\r\n]/)
    resize(nodes.tempInputElement, lines, 2 * paddingOffset)
    redrawScreen()

    // TODO: remember all \r for correct message sending
    tempInputEditHandler = () => {
        if (isTextElement(element)) {
            element.text = nodes.tempInputElement.value
            lines = createMultilineText(nodes.tempInputElement.value, Infinity).split(/[\r\n]/)
            resize(nodes.tempInputElement, lines)
        } else if (isStickerElement(element)) {
            element.text = nodes.tempInputElement.value
            lines = createMultilineText(nodes.tempInputElement.value, MAX_STICKER_WIDTH).split(/[\r\n]/)
            resize(nodes.tempInputElement, lines, 2 * paddingOffset)

            nodes.tempInputElement.value = lines.join('\n')
        }
        redrawScreen()
    }

    tempInputBlurHandler = () => {
        stopTrackText(element)
        changeSelectedType(CONTROL_TYPES.pointer)
        document.querySelector('[name=type][value=pointer]').checked = true
    }

    nodes.tempInputElement.addEventListener('input', tempInputEditHandler)
    nodes.canvas.addEventListener('click', tempInputBlurHandler)
}

export const startTrackText = (event) => {
    if (isEditableElement({ type: state.selectedType }) && !state.workInProgressElements.length) {
        state.workInProgressElements[0] = {
            points: [getCoordinates(event), getCoordinates(event)],
            type: state.selectedType,
            color: state.selectedColor,
            text: '',
        }

        editableText(state.workInProgressElements[0])
    }
}
