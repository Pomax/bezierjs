# Chai Stats

Statistical and additional numerical assertions for the Chai Assertion Library.

## Installation

#### Node.js

Chai spies are available on npm.

      $ npm install chai-stats

#### Browser

Include `chai-stats.js` after including `chai.js`. 

```xml
<script src="chai-stats.js"></script>
```

## Plug In

If you are using `chai-stats` in the browser, there is nothing you need to do. It will detect `chai` in the global
namespace and automagically get used.

If you are using node, here is a useful bit.

```js
var chai = require('chai')
  , chaiStats = require('chai-stats');

chai.use(chaiStats);

var should = chai.should()
  , expect = chai.expect; 
```

## API Reference

#### .almost.equal(expected, [precision])

The same as NumPy's `assert_almost_equal`, for scalars.
Assert near equality: `abs(expected-actual) < 0.5 * 10**(-decimal)`

```javascript
expect(3.1415).to.almost.equal(3.14159, 3);
assert.almostEqual(3.1416, 3.14159, 3, 'these numbers are almost equal');
```

#### .deepAlmostEqual(actual, expected, [decimal, message])

The same as NumPy's `assert_almost_equal`, for objects whose leaves are all numbers.
Assert near equality: `abs(expected-actual) < 0.5 * 10**(-decimal)` for every leaf.

```javascript
expect({ pi: 3.1416 }).to.almost.eql({ pi: 3.14159 }, 3);
assert.deepAlmostEqual({ pi: 3.1416 }, { pi: 3.14159 }, 3);
```


#### .sum

Modifies the assertion subject with the sum of an
array of number so it can be compared using chai's
core assertions.

```javascript
expect([ 1, 2, 3 ]).to.have.sum.equal(6);
expect([ 1, 2, 3 ]).to.have.sum.above(5);
expect([ 1, 2, 3 ]).to.have.sum.below(7);
```

#### .mean

Modifies the assertion subject with the mean of an
array of number so it can be compared using chai's
core assertions.

```javascript
expect([ 1, 2, 3 ]).to.have.mean.equal(2);
expect([ 1, 2, 3 ]).to.have.mean.above(1.5);
expect([ 1, 2, 3 ]).to.have.mean.below(2.5);
```

#### .deviation

Modifies the assertion subject with the standard
deviations of an array of number so it can be
compared using chai's core assertions.

```javascript
expect([ 1, 2, 3, 4 ]).to.have.deviation.almost.equal(1.290, 2);
```

## Tests 

Tests are written using [mocha](http://github.com/visionmedia/mocha) in the BDD interface.
Node tests can be executed using `make test`. Browser tests can be seen by opening `test/browser/index.html`.

## Contributors

     repo age : 3 months ago
     commits  : 21
     active   : 5 days
     files    : 14
     authors  :
        17  Jake Luer               81.0%
         4  josher19                19.0%

## License

(The MIT License)

Copyright (c) 2012 Jake Luer <jake@alogicalparadox.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE
