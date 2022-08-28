const path = require('path')

const express = require('express')

module.exports = (app) => {
    app.use('/dist', express.static(path.resolve(process.cwd(), 'dist')))
}
