exports.TRON_WIDTH = 360
exports.TRON_HEIGHT = 360
exports.TICK_TIME = 25
const DIRECTIONS = {
    up: 'up',
    left: 'left',
    down: 'down',
    right: 'right',
}
exports.DIRECTIONS = DIRECTIONS
exports.REVERT_DIRECTIONS = {
    [DIRECTIONS.left]: DIRECTIONS.right,
    [DIRECTIONS.right]: DIRECTIONS.left,
    [DIRECTIONS.up]: DIRECTIONS.down,
    [DIRECTIONS.down]: DIRECTIONS.up,
}
exports.COLORS = [
    '#e6194b',
    '#3cb44b',
    '#ffe119',
    '#0082c8',
    '#f58230',
    '#911eb4',
    '#f032e6',
    '#d2f53c',
    '#fabebe',
    '#e6beff',
    '#aa6e28',
    '#fffac8',
    '#800000',
    '#aaffc3',
    '#808000',
    '#ffd7b4',
    '#000080',
    '#808080',
    '#000000',
]
