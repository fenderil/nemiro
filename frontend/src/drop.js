import { DATA_ACTIONS, ELEMENT_TYPES } from './constants'
import { state } from './state'
import { getCoordinates } from './utils/coords'

export const dragCopy = (event) => {
    event.stopPropagation()
    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'
}

export const dragDrop = (event) => {
    event.stopPropagation()
    event.preventDefault()
    const { files } = event.dataTransfer
    const cursorPoint = getCoordinates(event)
    const filesCollection = [...files]

    filesCollection.forEach((file) => {
        if (file.type.match(/image.*/)) {
            const reader = new FileReader()

            reader.onload = (readerEvent) => {
                const image = new Image()
                image.src = readerEvent.target.result

                image.onload = () => {
                    state.sendDataUpdate({
                        points: [
                            [cursorPoint[0] - image.width / 2, cursorPoint[1] - image.height / 2],
                            [cursorPoint[0] + image.width / 2, cursorPoint[1] + image.height / 2],
                        ],
                        url: readerEvent.target.result,
                        type: ELEMENT_TYPES.image,
                        action: DATA_ACTIONS.add,
                    })
                }
            }

            reader.readAsDataURL(file)
        }
    })
}
