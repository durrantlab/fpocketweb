const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const HtmlWebpackPlugin = require('html-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const {
    CleanWebpackPlugin
} = require('clean-webpack-plugin');
// const ReplaceHashInFileWebpackPlugin = require('replace-hash-in-file-webpack-plugin');

module.exports = merge(common, {
    entry: {
        'app': [
            path.join(__dirname, '../../src/index.ts')
        ],
        'styles.css': [
            path.resolve(__dirname, '../../node_modules/bootstrap/dist/css/bootstrap.css'),
            path.resolve(__dirname, '../../node_modules/bootstrap-vue/dist/bootstrap-vue.css'),
            path.resolve(__dirname, '../../src/styles/bootstrap.min.css'),
            path.resolve(__dirname, '../../src/styles/style.css')
        ],
    },
    plugins: [
        new CleanWebpackPlugin(), // Clean dist
        new HtmlWebpackPlugin({
            title: 'FpocketWeb',
            template: path.join(__dirname, '../../src/index.html'),
            favicon: path.join(__dirname, '../../src/styles/favicon.ico'),
            minify: true,
            excludeAssets: [/vrmlWebWorker.*.js/]
        }),
        // new HtmlWebpackExcludeAssetsPlugin(),
        new webpack.ProvidePlugin({
            // For plugins that are not webpack-compatible. jquery needed for
            // 3dmol.
            $: 'jquery',
            jQuery: 'jquery',
            "window.jQuery": "jquery",
            $3Dmol: '3dmol',
            "window.$3Dmol": '3dmol',
        }),
        new CopyWebpackPlugin([
            // {
            //     from: 'src/FpocketWeb/vina.html.mem',
            //     to: 'vina.html.mem'
            // },
            // {
            //     from: 'src/FpocketWeb/vina.js',
            //     to: 'vina.js'
            // },
            // {
            //     from: 'src/FpocketWeb/vina.wasm',
            //     to: 'vina.wasm'
            // },
            // {
            //     from: 'src/FpocketWeb/vina.worker.js',
            //     to: 'vina.worker.js'
            // },
            {
                from: 'src/styles/webina_logo.jpg',
                to: 'webina_logo.jpg'
            },
            // {
            //     from: 'src/styles/favicon.ico',
            //     to: 'favicon.ico'
            // },
            {
                from: 'node_modules/vue/dist/vue.min.js', // min in prod
                to: 'vue.min.js'
            },
            {
                from: 'node_modules/vue/dist/vue.js', // min in prod
                to: 'vue.js'
            },
            {
                from: 'node_modules/bootstrap-vue/dist/bootstrap-vue.min.js',
                to: 'bootstrap-vue.min.js'
            },
            {
                from: 'node_modules/vuex/dist/vuex.min.js',
                to: 'vuex.min.js'
            },
            {
                from: 'src/FpocketWeb/dist',
                to: 'FpocketWeb'
            },
            {
                from: 'src/example/5j2v.pdb',
                to: '5j2v.pdb'
            },
            // {
            //     from: 'src/minimal_example.html',
            //     to: 'minimal_example.html'
            // },
            // {
            //     from: 'src/babel_convert.html',
            //     to: 'babel_convert.html'
            // },
            // {
            //     from: 'src/mol_editor',
            //     to: 'mol_editor'
            // }
        ]),
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // all options are optional
            filename: '[name].[hash].css',
            chunkFilename: '[name].[hash].css',  // '[name].[hash].[id].css',
            ignoreOrder: false, // Enable to remove warnings about conflicting order
        }),
        // new ReplaceHashInFileWebpackPlugin([{
        //     dir: 'dist',
        //     files: ['babel_convert.html'],
        //     rules: [{
        //         search: '{{HASH}}',
        //         replace: '[hash]'
        //     }]
        // }]),
    ],
    module: {
        rules: [{
                test: /\.css$/,
                use: [{
                    loader: MiniCssExtractPlugin.loader,
                    options: {
                        // you can specify a publicPath here
                        // by default it uses publicPath in webpackOptions.output
                        publicPath: '../',
                        hmr: process.env.NODE_ENV === 'development',
                    },
                }, 'css-loader'],
            },
            {
                test: /\.pdb$/i,
                use: 'raw-loader',
            },
            {
                test: /\.(gif|svg|jpg|png)$/,
                loader: "file-loader",
            }
        ]
    },
    output: {
        // No longer using hashes. Because google closure compiler makes
        // copies of files, which then get passed to service worker manifest,
        // causing all sorts of problems.
        chunkFilename: '[name].[hash].js', // contenthash
        filename: "[name].[hash].js" // contenthash
    },
    optimization: {
        moduleIds: 'hashed',
        splitChunks: {
            chunks: 'async',
            minSize: 0,  // 30000,
            maxSize: 250000,  // 0,
            minChunks: 1,
            maxAsyncRequests: 5,
            maxInitialRequests: 3,
            automaticNameDelimiter: '~',
            automaticNameMaxLength: 30,
            name: true,
            cacheGroups: {
            vendor: {
                test: /[\\/]node_modules[\\/]/,
                name: 'vendors',
                chunks: 'async'  // 'all'
            },
            default: {
                    minChunks: 2,
                    priority: -20,
                    reuseExistingChunk: true
                }
            }
        },
        // splitChunks: {
        //     chunks: 'all',
        //     cacheGroups: {
        //         vendor: {
        //             test: /[\\/]node_modules[\\/]/,
        //             name: 'vendors',
        //             chunks: 'all'
        //         }
        //     }
        // },
        runtimeChunk: 'single'
    }
});
