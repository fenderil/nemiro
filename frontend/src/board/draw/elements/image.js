import { state } from '../../../data/state'
import { image } from '../primitives/image'

export const drawImage = (points, url) => {
    image(points, url, { context: state.canvasContext })
}
