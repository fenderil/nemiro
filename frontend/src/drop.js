import { state } from './state'
import { getCoordinates } from './utils'

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

    files.forEach((file) => {
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
                        type: 'image',
                        action: 'add',
                    })
                }
            }

            reader.readAsDataURL(file)
        }
    })
}
