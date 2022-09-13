import { state } from '../data/state'
import { nodes } from '../data/nodes'

export const getCoordinatesOnWindow = (event, scale = state.currentScale) => {
    if (event.pageX || event.pageY) {
        return [
            Math.floor(event.pageX / scale),
            Math.floor(event.pageY / scale),
        ]
    } if (event.touches) {
        return [
            Math.floor(event.touches[0].pageX / scale),
            Math.floor(event.touches[0].pageY / scale),
        ]
    }

    return [0, 0]
}
export const getCoordinates = (event, scale = state.currentScale, htmlScale = state.currentScale) => {
    if (event.pageX || event.pageY) {
        return [
            Math.floor(nodes.canvasRoot.parentNode.scrollLeft / htmlScale + event.pageX / scale),
            Math.floor(nodes.canvasRoot.parentNode.scrollTop / htmlScale + event.pageY / scale),
        ]
    } if (event.touches) {
        return [
            Math.floor(nodes.canvasRoot.parentNode.scrollLeft / htmlScale + event.touches[0].pageX / scale),
            Math.floor(nodes.canvasRoot.parentNode.scrollTop / htmlScale + event.touches[0].pageY / scale),
        ]
    }

    return [0, 0]
}
