import {
    state,
    nodes,
    canvasContext,
    MAX_STICKER_WIDTH,
} from './state'
import {
    createMultilineText,
    isTextElement,
    isStickerElement,
    isEditableElement,
    getCoordinates,
} from './utils'
import { redrawScreen } from './draw'
import { changeSelectedType } from './controls'

const stopTrackText = (element) => {
    state.sendDataUpdate({
        ...element,
        action: element.id ? 'edit' : 'add',
    })

    nodes.tempInputElement.removeEventListener('input', state.tempInputEditHandler)
    nodes.canvasRoot.removeEventListener('click', state.tempInputBlurHandler)
    nodes.tempInputElement.classList.add('hidden')

    state.workInProgressElement = null
}

const resize = (input, rows) => {
    const width = Math.max(Math.max(...rows.map((row) => canvasContext.measureText(row).width)), 20)
    const height = Math.max(20 * rows.length, 20)
    input.style.width = `${width}px`
    input.style.height = `${height}px`
    state.workInProgressElement.points[1] = [
        state.workInProgressElement.points[0][0] + width,
        state.workInProgressElement.points[0][1] + height,
    ]
}

export const editableText = (element) => {
    nodes.tempInputElement.style.left = `${element.points[0][0] * state.currentScale - nodes.canvasRoot.parentNode.scrollLeft}px`
    nodes.tempInputElement.style.top = `${element.points[0][1] * state.currentScale - nodes.canvasRoot.parentNode.scrollTop}px`
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
        } else if (isStickerElement(element)) {
            element.text = event.target.value
            lines = createMultilineText(event.target.value, MAX_STICKER_WIDTH).split(/[\r\n]/)
            event.target.value = lines.join('\n')
        }

        resize(nodes.tempInputElement, lines)
        redrawScreen()
    }

    state.tempInputBlurHandler = () => {
        stopTrackText(element)
        changeSelectedType('pointer')
        document.querySelector('[name=type][value=pointer]').checked = true
    }

    nodes.tempInputElement.addEventListener('input', state.tempInputEditHandler)
    nodes.canvasRoot.addEventListener('click', state.tempInputBlurHandler)
}

export const startTrackText = (event) => {
    if (isEditableElement({ type: state.selectedType }) && !state.workInProgressElement) {
        state.workInProgressElement = {
            points: [getCoordinates(event), getCoordinates(event).map((i) => i + 20)],
            type: state.selectedType,
            color: state.selectedColor,
            text: '',
        }

        editableText(state.workInProgressElement)
    }
}
