# Bezier.js

An ES Module based library for Node.js and browsers for doing (quadratic and cubic) Bezier curve work.

For a Demo and the API, hit up either [pomax.github.io/bezierjs](http://pomax.github.io/bezierjs)
or read the souce (`./lib` for the library code, start at `bezier.js`).

**Note:** if you're looking for the legacy ES5 version of this library, you will have to install v2.6.1 or below. However, be aware that the ES5 version will not have any fixes/updates backported.

## Installation

`npm install bezier-js` will add bezier.js to your dependencies, remember to add `--save` or `--save-dev` if you need that to be persistent of course.

### "Not" installation if you just want a single file

There is an already rolled-up version of `bezier.js` in the `docs` directory. Just use that.

## Use

`import { Bezier } from "bezier-js"` and off you go.

## Use in the browser

Copy the contents of the `lib` directory to wherever you like (`/js`, `/vendor`, etc), or place the rolled-up version of the library there, and then load the library using a script element:

```
<!doctype html>
  <head>
    ...
    <script src="/some/location/bezier.js" type="module" async>
  </head>
  <body>
    ...
  </body>
</html>
```

Note that modules execute as if they had the `defer` attribute, so you don't need to manually specify it.


## Working on the code

To test new code, use `npm test`.

There is no build step for the library itself, but to build it for the websiteTo build the library, use `npm run build`.

## License

This code is MIT licensed.

## Engagement

For comments and questions, [tweet at me](https://twitter.com/TheRealPomax) or file an issue.
