#!/usr/bin/env babel-node --stage=0 --
import path from 'path';

import createServer from './';
import { argv } from 'yargs';

let configPath = path.resolve(
  './',
  argv.c || argv.config || 'webpack.config.js'
);
let hot = argv.h || argv.hot;
let directory = path.resolve(
  './',
  argv._[0] || argv.d || argv.directory
);
let port = argv.p || argv.port;
let devServerPort = argv.devServerPort;
let regExp = argv.r || argv.regExp;

createServer(require(configPath), {
  hot,
  directory,
  port,
  devServerPort,
  regExp,
});
