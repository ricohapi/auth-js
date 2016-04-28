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
      query: {
        presets: ['es2015'],
        compact: false
      }
    }]
  },
  resolve: {
    extensions: ['', '.js'],
  }
};
