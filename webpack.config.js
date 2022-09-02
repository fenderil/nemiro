const path = require('path')

module.exports = {
    entry: './frontend/src/index.js',
    output: {
        path: path.resolve(process.cwd(), 'dist'),
        filename: 'index.js',
        publicPath: process.env.NODE_ENV === 'development' ? '/dist' : void '',
    },
    resolve: {
        extensions: ['.js'],
    },
    devtool: process.env.NODE_ENV === 'development' ? 'inline-source-map' : void '',
    mode: process.env.NODE_ENV,
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                },
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader',
                    'postcss-loader',
                ],
            },
        ],
    },
}
