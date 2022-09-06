import {
    CONTROL_TYPES,
    ELEMENT_TYPES,
} from '../constants'

export const isPointer = (type) => type === CONTROL_TYPES.pointer

export const isImageElement = (element) => element.type === ELEMENT_TYPES.image
export const isRectElement = (element) => element.type === ELEMENT_TYPES.rect
export const isLineElement = (element) => element.type === ELEMENT_TYPES.line
export const isRowElement = (element) => element.type === ELEMENT_TYPES.row
export const isTextElement = (element) => element.type === ELEMENT_TYPES.text
export const isStickerElement = (element) => element.type === ELEMENT_TYPES.sticker

export const isEditableElement = (element) => isTextElement(element)
    || isStickerElement(element)
export const isBoxElement = (element) => isImageElement(element)
    || isEditableElement(element)
export const isDrawingElement = (element) => isImageElement(element)
    || isRectElement(element)
    || isLineElement(element)
    || isRowElement(element)
