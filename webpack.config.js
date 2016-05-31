module.exports = {
  entry: './samples/index.js',
  output: {
    filename: './build/ricohapi-auth.js',
    library: "RicohAPIAuth",
    libraryTarget: "umd"
  },
  module: {
    loaders: [{
      test: /\.js$/,
      loader: 'babel',
      exclude: /node_modules/,
      query: {
        presets: ['es2015'],
        compact: false,
        cacheDirectory: true
      }
    }]
  },
  resolve: {
    extensions: ['', '.js'],
    modulesDirectories: ['node_modules'],
    module: {
      noParse: [ /\.\/dada\//, /\.\/nightwatch\// ],
    },
  }
};
