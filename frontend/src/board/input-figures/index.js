import { state } from '../../data/state'
import { nodes } from '../../data/nodes'
import {
    isRectElement,
    isRowElement,
    isLineElement,
    isDrawingElement,
} from '../../utils/types'
import { getCoordinates } from '../../utils/coords'
import { redrawScreen } from '../draw'
import { DATA_ACTIONS } from '../../data/constants'

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

    nodes.canvas.removeEventListener('mousemove', trackFigure)
    nodes.canvas.removeEventListener('mouseup', sendFigure)
    nodes.canvas.removeEventListener('touchmove', trackFigure)
    nodes.canvas.removeEventListener('touchend', sendFigure)

    state.workInProgressElements = []
}

export const startFigure = (event) => {
    if (isDrawingElement({ type: state.selectedType })) {
        state.workInProgressElements[0] = {
            points: [getCoordinates(event), getCoordinates(event)],
            type: state.selectedType,
            color: state.selectedColor,
        }

        nodes.canvas.addEventListener('mousemove', trackFigure)
        nodes.canvas.addEventListener('mouseup', sendFigure)
        nodes.canvas.addEventListener('touchmove', trackFigure)
        nodes.canvas.addEventListener('touchend', sendFigure)
    }
}
