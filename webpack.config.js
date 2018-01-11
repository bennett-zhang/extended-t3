const path = require("path")
const webpack = require("webpack")
const HTMLPlugin = require("html-webpack-plugin")
const ExtractTextPlugin = require("extract-text-webpack-plugin")

module.exports = {
  entry: "./src/index.js",
  output: {
    filename: "bundle.js",
    path: path.join(__dirname, "dist")
  },
  devtool: "source-map",
  module: {
    rules: [
      {
				test: /\.scss$/,
				use: ExtractTextPlugin.extract({
					fallback: "style-loader",
					use: [
						{
							loader: "css-loader",
							options: {
								sourceMap: true
							}
						},
						{
							loader: "postcss-loader",
							options: {
								plugins: () => [
									require("autoprefixer")
								],
								sourceMap: true
							}
						},
						{
							loader: "sass-loader",
							options: {
								sourceMap: true
							}
						}
					]
				})
			},
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["env"]
          }
        }
      }
    ]
  },
  plugins: [
    new HTMLPlugin({
      template: "src/index.html"
    }),
    new ExtractTextPlugin("master.css"),
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery"
    })
  ]
}
