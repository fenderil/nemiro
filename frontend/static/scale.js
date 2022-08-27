canvasRoot.addEventListener('wheel', (event) => {
  let delta = 0

  if (event.deltaY >= 1) {
    delta = 0.01
  } else if (event.deltaY <= -1) {
    delta = -0.01
  }

  currentScale = clamp(currentScale + delta, scaleMin, scaleMax)

  canvasRoot.style.transform = `scale(${currentScale})`
  document.getElementById('textarea').style.transform = `scale(${currentScale})`
})

const localMultiTouchDistance = (event) => {
  const zw = event.touches[0].pageX - event.touches[1].pageX
  const zh = event.touches[0].pageY - event.touches[1].pageY
  return Math.sqrt(zw * zw + zh * zh)
}

let localMultiTouchScale = null
canvasRoot.addEventListener('touchstart', (event) => {
  if (event.touches.length > 1) {
    event.preventDefault()
    localMultiTouchScale = localMultiTouchDistance(event)
  }
})

canvasRoot.addEventListener('touchmove', (event) => {
  if (event.touches.length > 1) {
    event.preventDefault()

    currentScale = clamp(localMultiTouchDistance(event) / localMultiTouchScale, scaleMin, scaleMax)

    canvasRoot.style.transform = `scale(${currentScale})`
    document.getElementById('textarea').style.transform = `scale(${currentScale})`
  }
})
