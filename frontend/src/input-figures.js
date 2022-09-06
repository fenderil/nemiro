import { state } from './state'
import { nodes } from './nodes'
import {
    isRectElement,
    isRowElement,
    isLineElement,
    isDrawingElement,
} from './utils/types'
import { getCoordinates } from './utils/coords'
import { redrawScreen } from './draw'
import { DATA_ACTIONS } from './constants'

const trackFigure = (event) => {
    if (isRectElement({ type: state.selectedType }) || isRowElement({ type: state.selectedType })) {
        state.workInProgressElements[0].points[1] = getCoordinates(event)
    } else if (isLineElement({ type: state.selectedType })) {
        state.workInProgressElements[0].points.push(getCoordinates(event))
    }

    redrawScreen()
}

const sendFigure = () => {
    state.sendDataUpdate({
        ...state.workInProgressElements[0],
        action: DATA_ACTIONS.add,
    })

    nodes.canvasRoot.removeEventListener('mousemove', trackFigure)
    nodes.canvasRoot.removeEventListener('mouseup', sendFigure)
    nodes.canvasRoot.removeEventListener('touchmove', trackFigure)
    nodes.canvasRoot.removeEventListener('touchend', sendFigure)

    state.workInProgressElements = []
}

export const startFigure = (event) => {
    if (isDrawingElement({ type: state.selectedType })) {
        state.workInProgressElements[0] = {
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
