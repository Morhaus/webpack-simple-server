import fs from 'fs';
import path from 'path';

import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import express from 'express';

const r = strings => path.resolve(__dirname, ...strings);

const BUNDLE_PATH = '/';
const BUNDLE_FILENAME = 'bundle.js';
const REQUIRE_PREFIX = '__WSS__';

function findAllFiles(directory) {
  return fs
    .readdirSync(directory)
    .reduce((files, item) => {
      let itemFullPath = path.join(directory, item);
      let stat = fs.statSync(itemFullPath);
      if (stat.isFile()) {
        files = files.concat([itemFullPath]);
      } else if (stat.isDirectory()) {
        files = files.concat(findAllFiles(itemFullPath));
      }
      return files;
    }, []);
}

export default function createServer(
  compilerOptions,
  {
    directory,
    regExp = /\.jsx?$/,
    hot = false,
    port,
    devServerPort,
  }
) {
  port = parseInt(port) || 8080;
  devServerPort = parseInt(devServerPort) || port + 1;

  let publicPath = `http://localhost:${devServerPort}`;

  let entry = [
    `${require.resolve('webpack-dev-server/client')}?${publicPath}`,
  ];

  if (hot) {
    entry.push(require.resolve('webpack/hot/only-dev-server'));
  }

  entry.push(r`entry.js`);

  compilerOptions = {
    ...compilerOptions,
    entry,
    output: {
      ...(compilerOptions.output || {}),
      path: BUNDLE_PATH,
      filename: BUNDLE_FILENAME,
      publicPath: publicPath,
    },
    plugins: [
      ...(compilerOptions.plugins || []),
      new webpack.DefinePlugin({
        __WSS_REQUIRE_PREFIX__: JSON.stringify(REQUIRE_PREFIX),
        __WSS_REGEXP__: regExp.toString(),
        __WSS_DIR__: JSON.stringify(directory),
      }),
    ]
  };

  let compiler = webpack(compilerOptions);

  const webpackDevServer = new WebpackDevServer(compiler, { hot });
  webpackDevServer.listen(devServerPort);

  const app = express();

  app.get('/', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Entries</title>
        </head>
        <body>
          <h1>Entries</h1>
          <ul>
            ${
              findAllFiles(directory)
                .filter(item => regExp.test(item))
                .map(item => path.relative(directory, item))
                .map(item => `
                  <li>
                    <a href="${item}">${item}</a>
                  </li>
                `)
                .join('')
            }
          </ul>
        </body>
      </html>
    `);
  });

  app.get('*', (req, res) => {
    let resourceFullPath = path.join(directory, req.originalUrl);
    let resourceRelativePath = path.relative(directory, resourceFullPath);
    let resourceName = path.basename(resourceFullPath);
    if (
      fs.existsSync(resourceFullPath) &&
      regExp.test(resourceFullPath)
    ) {
      res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${resourceName}</title>
          </head>
          <body>
            <script src="${publicPath}${BUNDLE_PATH}${BUNDLE_FILENAME}"></script>
            <script>${REQUIRE_PREFIX}('./${resourceRelativePath}')</script>
          </body>
        </html>
      `);
      return;
    }

    res.status(404).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${resourceName} not found</title>
        </head>
        <body>
          ${resourceName} not found
        </body>
      </html>
    `);
  });

  app.listen(port);

  return app;
}
