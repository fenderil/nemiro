const trackLongTouch = () => {
  if (longTouchTimeoutId) {
    longTouch = false
    longTouchTimeoutId = null
  } else {
    longTouchTimeoutId = setTimeout(() => {
      longTouch = true
      longTouchTimeoutId = null
    }, 1000)
  }
}

const untrackLongTouch = () => {
  longTouch = false
  clearTimeout(longTouchTimeoutId)
}

const withLongTouch = (cb, is) => (event) => {
  if (is) {
    setTimeout(cb, 1010, event)
  }
}

canvas.addEventListener('touchstart', trackLongTouch)
canvas.addEventListener('touchend', untrackLongTouch)

const showContextMenu = (event, contextElements) => {
  contextDeleteHandler = () => {
    contextElements.forEach((contextElement) => {
      sendDataUpdate({
        id: contextElement.id,
        action: 'delete',
      })
    })

    contextMenuOpened = false
    hideContextMenu()
    cursorSelectedElements = []
  }

  contextEditHandler = () => {
    if (isEditableElement(contextElements[0])) {
      workInProgressElement = contextElements[0]
      editableText(workInProgressElement)

      contextMenuOpened = false
      hideContextMenu()
    }
  }

  if (contextElements.length > 1 || !isEditableElement(contextElements[0])) {
    editContext.classList.add('hidden')
  } else {
    editContext.addEventListener('click', contextEditHandler)
  }

  deleteContext.addEventListener('click', contextDeleteHandler)
  const [left, top] = getCoordinatesOnWindow(event, 1)
  contextMenu.style.left = `${left}px`
  contextMenu.style.top = `${top}px`
  contextMenu.classList.remove('hidden')
}

const hideContextMenu = () => {
  contextMenu.classList.add('hidden')
  editContext.classList.remove('hidden')
  editContext.removeEventListener('click', contextEditHandler)
  deleteContext.removeEventListener('click', contextDeleteHandler)
}

const trackContextMenu = (event) => {
  event.preventDefault()

  if (!contextMenuOpened && cursorSelectedElements.length && isPointer(selectedType)) {
    contextMenuOpened = true
    showContextMenu(event, cursorSelectedElements)
  } else {
    contextMenuOpened = false
    hideContextMenu()
  }
}

canvas.addEventListener('contextmenu', trackContextMenu)
canvas.addEventListener('touchstart', withLongTouch(trackContextMenu))
