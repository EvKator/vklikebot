var webpack = require('webpack');
var path = require('path');
module.exports = {
	target : 'node',
    entry: "./src/app.js",
    output: {
        path: __dirname + '/out/build/',
        publicPath: "build/",
        filename: "bundle.js"
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: "babel-loader",
                exclude: [/node_modules/]
            }
        ]
    },
    watch: true
};