canvasRoot.addEventListener('wheel', (event) => {
    let delta = 0
    
    if (event.deltaY >= 1) {
        delta = 0.01
    } else if (event.deltaY <= -1) {
        delta = -0.01
    }

    currentScale = Math.max(
        scaleMin,
        Math.min(
            scaleMax,
            currentScale + delta
        )
    )

    canvasRoot.style.transform = `scale(${currentScale})`
    document.getElementById('textarea').style.transform = `scale(${currentScale})`
})
