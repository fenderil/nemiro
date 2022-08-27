canvasRoot.addEventListener('dragover', (event) => {
    event.stopPropagation()
    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'
})

canvasRoot.addEventListener('drop', (event) => {
    event.stopPropagation()
    event.preventDefault()
    const { files } = event.dataTransfer
    const cursorPoint = getCoordinates(event)

    for (let i = 0, file; file = files[i]; i += 1) {
        if (file.type.match(/image.*/)) {
            const reader = new FileReader()

            reader.onload = (readerEvent) => {
                const image = new Image()
                image.src = readerEvent.target.result

                image.onload = () => {
                    sendDataUpdate({
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
    }
})
