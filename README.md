# webpack-simple-server

Simple webpack server for serving a directory of entries.

## Installation

```
npm install -g webpack-simple-server
```

## Usage

```
webpack-simple-server [options] directory

Options:
  -h, --hot                     Switches the server to hot mode
  -c path, --config path        Set webpack config path (defaults to webpack.config.js)
  -p port, --port port          Set server port (defaults to 8080)
  -d port, --devServerPort port Set webpack-dev-server port (defaults to port + 1)
  -r re, --regExp re            Filter files from directory with re
```

## Example

Say you have an `examples/` directory at the root of your project, which contains a simple `app.js` script.

```
project/
  examples/
    app.js
  webpack.config.js
```

### Bootstrap

```
npm install react babel-loader
```

### app.js

```js
import React from 'react';

React.render(<div>Hello World</div>, document.body);
```

### webpack.config.js

```js
export default {
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loader: 'babel?stage=0',
        exclude: /node_modules/,
      },
    ],
  },
};
```

Then, just run `webpack-simple-server examples/` in your project directory, point your browser to `localhost:8080/app.js` and voilà!
