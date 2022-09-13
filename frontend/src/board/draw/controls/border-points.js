import { state } from '../../../data/state'
import { createControlPoints, isPointsEqual } from '../../../utils/points'

import { circle } from '../primitives/circle'

export const drawBorderPoints = (borders) => {
    createControlPoints(borders)
        .forEach((controlPoint) => {
            const controlPointHovered = state.cursorSelectedControlPoint
                ? isPointsEqual(state.cursorSelectedControlPoint, controlPoint)
                : false
            circle(
                controlPoint,
                controlPointHovered ? 8 : 6,
                { fillColor: 'white', strokeColor: 'black', context: state.canvasContext },
            )
        })
}
