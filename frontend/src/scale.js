import {
    nodes,
    state,
} from './state'
import { clamp } from './utils'
import {
    SCALE_MIN,
    SCALE_MAX,
} from './constants'

const setNewScale = () => {
    nodes.canvasRoot.style.transform = `scale(${state.currentScale})`
    document.getElementById('textarea').style.transform = `scale(${state.currentScale})`
}

export const scaleOnWheel = (event) => {
    let delta = 0

    if (event.deltaY >= 1) {
        delta = 0.01
    } else if (event.deltaY <= -1) {
        delta = -0.01
    }

    state.currentScale = clamp(state.currentScale + delta, SCALE_MIN, SCALE_MAX)

    setNewScale()
}

const localMultiTouchDistance = (event) => {
    const zw = event.touches[0].pageX - event.touches[1].pageX
    const zh = event.touches[0].pageY - event.touches[1].pageY
    return Math.sqrt(zw ** 2 + zh ** 2)
}

let localMultiTouchScale = null

export const scaleTouchStart = (event) => {
    if (event.touches.length > 1) {
        event.preventDefault()
        localMultiTouchScale = localMultiTouchDistance(event)
    }
}

export const scaleTouchMove = (event) => {
    if (event.touches.length > 1) {
        event.preventDefault()

        state.currentScale = clamp(localMultiTouchDistance(event) / localMultiTouchScale, SCALE_MIN, SCALE_MAX)

        setNewScale()
    }
}
