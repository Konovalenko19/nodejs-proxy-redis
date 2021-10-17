var path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin');
  
module.exports = {
    mode: "development",
    entry: ["./src/index.js"],
    output:{
        path: path.resolve(__dirname, "./build"),
        filename: "bundle.js",
    },
    devServer: {
        historyApiFallback: true,
        port: 3100,
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, "./src/index.html"),
        }),
    ],
    module: {
        rules: [
            {
                test: /\.js(x)?$/,
                exclude: /(node_module)/,
                loader: "babel-loader",
            },
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
            },
        ],
    },
};
