const path = require('path');
var DuplicatePackageCheckerPlugin = require("duplicate-package-checker-webpack-plugin");
// const webpack = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const { DefinePlugin } = require('webpack');

module.exports = {
    plugins: [
        new DuplicatePackageCheckerPlugin(),
        // new webpack.ExtendedAPIPlugin()  // Gives hash as __webpack_hash__
        // new BundleAnalyzerPlugin({analyzerMode: "static"}),
        new DefinePlugin({
            __BUILD_TIME__: '"Built on ' + new Date().toLocaleString() + '"'
        })
    ],
    module: {
        rules: [
            { test: /\.tsx?$/, loader: "ts-loader" },
            {
                test: /\.htm$/i,
                loader: 'html-loader',
            },
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.vue'],
        alias: {
             'vue$': 'vue/dist/vue.esm.js'
        }
    },
    output: {
        path: path.resolve(__dirname, '../../dist')
    }
};
