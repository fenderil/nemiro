const webpack = require('webpack')
const middleware = require('webpack-dev-middleware')

const webpackConfig = require('../webpack.config')

module.exports = (app) => {
    app.use(middleware(webpack(webpackConfig)))
}
