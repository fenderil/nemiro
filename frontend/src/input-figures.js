import { state, nodes } from './state'
import {
    isRectElement,
    isRowElement,
    getCoordinates,
    isLineElement,
    isDrawingElement,
} from './utils'
import { redrawScreen } from './draw'

const trackFigure = (event) => {
    if (isRectElement({ type: state.selectedType }) || isRowElement({ type: state.selectedType })) {
        state.workInProgressElement.points[1] = getCoordinates(event)
    } else if (isLineElement({ type: state.selectedType })) {
        state.workInProgressElement.points.push(getCoordinates(event))
    }

    redrawScreen()
}

const sendFigure = () => {
    state.sendDataUpdate({
        ...state.workInProgressElement,
        action: 'add',
    })

    nodes.canvasRoot.removeEventListener('mousemove', trackFigure)
    nodes.canvasRoot.removeEventListener('mouseup', sendFigure)
    nodes.canvasRoot.removeEventListener('touchmove', trackFigure)
    nodes.canvasRoot.removeEventListener('touchend', sendFigure)

    state.workInProgressElement = null
}

export const startFigure = (event) => {
    if (isDrawingElement({ type: state.selectedType })) {
        state.workInProgressElement = {
            points: [getCoordinates(event), getCoordinates(event)],
            type: state.selectedType,
            color: state.selectedColor,
        }

        nodes.canvasRoot.addEventListener('mousemove', trackFigure)
        nodes.canvasRoot.addEventListener('mouseup', sendFigure)
        nodes.canvasRoot.addEventListener('touchmove', trackFigure)
        nodes.canvasRoot.addEventListener('touchend', sendFigure)
    }
}
