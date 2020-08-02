import path from 'path';
import resolve from '@rollup/plugin-node-resolve';
import sourcemaps from 'rollup-plugin-sourcemaps';
import babel from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';
import * as pkg from './package.json';

const basePlugins = [
  resolve(),
  babel(),
  sourcemaps()
];
const compiled = (new Date()).toUTCString().replace(/GMT/g, 'UTC');
const banner = [
  '/*!',
  ` * bezier-js - v${pkg.version}`,
  ` * Compiled ${compiled}`,
  ' *',
  ' * bezier-js is licensed under the MIT License.',
  ' * http://www.opensource.org/licenses/mit-license',
  ' */'
].join('\n');

export default [
  {
    plugins: basePlugins,
    input: path.join(__dirname, './src/index.js'),
    output: [
      {
        // Trick to allow "const Bezier = require('bezier-js');"
        footer: 'module.exports = Object.assign(Bezier, exports)',
        file: path.join(__dirname, './lib/bezier.js'),
        format: 'cjs',
        freeze: false,
        sourcemap: true
      },
      {
        banner,
        file: path.join(__dirname, './lib/bezier.es.js'),
        format: 'esm',
        freeze: false,
        sourcemap: true
      }
    ]
  },
  {
    plugins: [...basePlugins, terser()],
    input: path.join(__dirname, './src/index.js'),
    output: {
      banner,
      name: 'Bezier',
      format: 'iife',
      file: path.join(__dirname, './dist/bezier.js'),
      sourcemap: true,
      freeze: false,
      // Don't export the whole library
      footer: 'Bezier = Bezier.Bezier'
    }
  }
];
