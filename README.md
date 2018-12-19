# Bezier.js

A node.js and client-side library for (quadratic and cubic) Bezier curve work.

For a Demo and the API, hit up either [pomax.github.io/bezierjs](http://pomax.github.io/bezierjs)
or read the souce (`./lib` for the library code, start at `index.js`).

## Installation

`npm install bezier-js` will add bezier.js to your dependencies, remember to add `--save` or `--save-dev` if you need that to be persistent of course.

## Use

`var Bezier = require('bezier-js')` and off you go.

## Use in the browser

Load the toplevel `bezier.js` the same way you would any other browser script, using a `<script src="..."></script>` declaration.

## Working on the code

To rebuild, simply use `npm test`, which runs both the build and tests (which aren't very
test-like atm, they just allow you to valid two curves. More to come). For comments and
questions, [tweet at me](https://twitter.com/TheRealPomax) or file an issue.

This code is MIT licensed.
