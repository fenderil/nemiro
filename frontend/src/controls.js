import { nodes, state } from './state'
import './controls.css'
import { DATA_ACTIONS } from './constants'

nodes.canvasRoot.classList.add('pointer')

nodes.customColorIndicator.style.borderColor = nodes.customColorSelector.value

export const changeSelectedType = (value) => {
    nodes.canvasRoot.classList.remove(state.selectedType)
    state.selectedType = value
    nodes.canvasRoot.classList.add(state.selectedType)
}

export const changeSelectedColor = (value) => {
    if (value !== 'custom') {
        state.selectedColor = value

        if (state.cursorSelectedElements.length) {
            state.cursorSelectedElements.forEach((element) => {
                state.sendDataUpdate({
                    ...element,
                    color: state.selectedColor,
                    action: DATA_ACTIONS.edit,
                })
            })
        }
    }
}

export const clickCustomColor = () => {
    document.getElementById('customColorFake').checked = true
    state.selectedColor = nodes.customColorSelector.value

    if (state.cursorSelectedElements.length) {
        state.cursorSelectedElements.forEach((element) => {
            state.sendDataUpdate({
                ...element,
                color: state.selectedColor,
                action: DATA_ACTIONS.edit,
            })
        })
    }
}

export const changeCustomColor = (event) => {
    state.selectedColor = event.target.value
    nodes.customColorIndicator.style.borderColor = event.target.value

    if (state.cursorSelectedElements.length) {
        state.cursorSelectedElements.forEach((element) => {
            state.sendDataUpdate({
                ...element,
                color: state.selectedColor,
                action: DATA_ACTIONS.edit,
            })
        })
    }
}

export const copyToClipboard = () => {
    window.navigator.clipboard.writeText(window.location)
    alert('Link in clipboard')
}
