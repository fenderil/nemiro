const imagesMap = {}

const withOnload = (fn) => (points, url) => {
    if (imagesMap[url]) {
        fn(points, url)
    } else {
        const image = new Image()
        image.src = url
        image.onload = () => {
            imagesMap[url] = image
            fn(points, url)
        }
    }
}

export const image = withOnload((points, url, { context }) => {
    context.drawImage(
        imagesMap[url],
        points[0][0],
        points[0][1],
        points[1][0] - points[0][0],
        points[1][1] - points[0][1],
    )

    context.restore()
    context.save()
})
