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

const stopTrackText = (element) => {
    state.sendDataUpdate({
        ...element,
        action: element.id ? DATA_ACTIONS.edit : DATA_ACTIONS.add,
    })

    nodes.tempInputElement.removeEventListener('input', state.tempInputEditHandler)
    nodes.canvasRoot.removeEventListener('click', state.tempInputBlurHandler)
    nodes.tempInputElement.classList.add('hidden')

    state.workInProgressElements = []
}

const resize = (input, rows) => {
    const width = Math.max(...rows.map(getStringWidth), STRING_HEIGHT)
    const height = STRING_HEIGHT * rows.length || STRING_HEIGHT
    input.style.width = `${width}px`
    input.style.height = `${height}px`
    state.workInProgressElements[0].points[1] = [
        state.workInProgressElements[0].points[0][0] + width + 2 * STICKER_OFFSET,
        state.workInProgressElements[0].points[0][1] + height + 2 * STICKER_OFFSET,
    ]
}

export const editableText = (element) => {
    nodes.tempInputElement.style.left = `${element.points[0][0] * state.currentScale - nodes.canvasRoot.parentNode.scrollLeft + STICKER_OFFSET / 2}px`
    nodes.tempInputElement.style.top = `${element.points[0][1] * state.currentScale - nodes.canvasRoot.parentNode.scrollTop + STICKER_OFFSET / 2}px`
    nodes.tempInputElement.classList.remove('hidden')
    nodes.tempInputElement.value = element.text || ''
    nodes.tempInputElement.focus()

    let lines = createMultilineText(element.text || '', Infinity).split(/[\r\n]/)
    resize(nodes.tempInputElement, lines)
    redrawScreen()

    // TODO: remember all \r for correct message sending
    state.tempInputEditHandler = (event) => {
        if (isTextElement(element)) {
            element.text = event.target.value
            lines = createMultilineText(event.target.value, Infinity).split(/[\r\n]/)
            resize(nodes.tempInputElement, lines)
        } else if (isStickerElement(element)) {
            element.text = event.target.value
            lines = createMultilineText(event.target.value, MAX_STICKER_WIDTH).split(/[\r\n]/)
            resize(nodes.tempInputElement, lines)

            event.target.value = lines.join('\n')
        }
        redrawScreen()
    }

    state.tempInputBlurHandler = () => {
        stopTrackText(element)
        changeSelectedType(CONTROL_TYPES.pointer)
        document.querySelector('[name=type][value=pointer]').checked = true
    }

    nodes.tempInputElement.addEventListener('input', state.tempInputEditHandler)
    nodes.canvasRoot.addEventListener('click', state.tempInputBlurHandler)
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
