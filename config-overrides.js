const { override, addWebpackResolve } = require('customize-cra');

module.exports = override(
  addWebpackResolve({
    fallback: {
      "path": require.resolve("path-browserify"),
      "crypto": require.resolve("crypto-browserify"),
      "buffer": require.resolve("buffer"),
      "fs": false,
      "stream": require.resolve("stream-browserify"),
      "url": require.resolve("url"),
      "vm": require.resolve("vm-browserify")
    }
  })
);
