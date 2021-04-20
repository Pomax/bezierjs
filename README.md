# Bezier.js

:warning:
**This package needs your support to stay maintained.** If you work for an organization
whose website is better off using Bezier.js than rolling its own code
solution, please consider talking to your manager to help
[fund this project](https://www.paypal.com/donate/?cmd=_s-xclick&hosted_button_id=QPRDLNGDANJSW).
Open Source is free to use, but certainly not free to develop. If you have the
means to reward those whose work you rely on, please consider doing so.
:warning:

An ES Module based library for Node.js and browsers for doing (quadratic and cubic) Bezier curve work.

For a Demo and the API, hit up either [pomax.github.io/bezierjs](http://pomax.github.io/bezierjs) or read the souce (`./src` for the library code, start at `bezier.js`).

**Note:** if you're looking for the legacy ES5 version of this library, you will have to install v2.6.1 or below. However, be aware that the ES5 version will not have any fixes/updates back-ported.

## Installation

`npm install bezier-js` will add bezier.js to your dependencies, remember to add `--save` or `--save-dev` if you need that to be persistent of course.

### Without using a package manager

There is a rolled-up version of `bezier.js` in the `dist` directory. Just [download that](https://raw.githubusercontent.com/Pomax/bezierjs/master/dist/bezier.js) and drop it in your JS asset dir.

## In Node, as dependency

About as simple as it gets:

```
import { Bezier } from "bezier-js";

const b = new Bezier(...);
```

Or, using the legacy CommonJS syntax:

```
const Bezier = require("bezier-js");

const b = new Bezier(...);
```

### Node support matrix

| Node Version | Require Supported | Import Supported                    |
| ------------ | ----------------- | ----------------------------------- |
| v12.0.0      | Yes               | Yes <sup>Experimental Flag</sup>    |
| v12.14.1     | Yes               | No <sup>Experimental Flag</sup>     |
| v12.17.0     | Yes               | Yes <sup>Experimental Warning</sup> |
| v12.22.1     | Yes               | Yes                                 |
| v14.0.0      | Yes               | Yes                                 |
| v14.16.1     | Yes               | Yes                                 |

## In Node or the browser, from file

Copy the contents of the `src` directory to wherever you like (`/js`, `/vendor`, etc), or place the rolled-up version of the library there, and then load the library as an import to whatever script needs to use the `Bezier` constructor using:

```
import { Bezier } from "/js/vendor/bezier.js";

const b = new Bezier(...);
```

## Working on the code

All the code is in the `src` directory, with `bezier.js` as entry point.

To test code (which automatically applies code formatting and rollup), use `npm test`.

There is no explicit build step for the library, `npm test` takes care of everything, except checking for code coverage.

## License

This code is MIT licensed.

## Engagement

For comments and questions, [tweet at me](https://twitter.com/TheRealPomax) or file an issue.
