!function (name, definition) {
  if (typeof define == 'function' && typeof define.amd  == 'object') define(definition);
  else this[name] = definition();
}('chai_stats', function () {
  // CommonJS require()
  function require(p){
    var path = require.resolve(p)
      , mod = require.modules[path];
    if (!mod) throw new Error('failed to require "' + p + '"');
    if (!mod.exports) {
      mod.exports = {};
      mod.call(mod.exports, mod, mod.exports, require.relative(path));
    }
    return mod.exports;
  }

  require.modules = {};

  require.resolve = function (path){
    var orig = path
      , reg = path + '.js'
      , index = path + '/index.js';
    return require.modules[reg] && reg
      || require.modules[index] && index
      || orig;
  };

  require.register = function (path, fn){
    require.modules[path] = fn;
  };

  require.relative = function (parent) {
    return function(p){
      if ('.' != p[0]) return require(p);

      var path = parent.split('/')
        , segs = p.split('/');
      path.pop();

      for (var i = 0; i < segs.length; i++) {
        var seg = segs[i];
        if ('..' == seg) path.pop();
        else if ('.' != seg) path.push(seg);
      }

      return require(path.join('/'));
    };
  };


require.register("calc", function (module, exports, require) {
/*!
 * Chai Stats - calculation utilities
 * Copyright (c) 2012 Jake Luer <jake@alogicalparadox.com>
 * MIT Licenced
 */

/**
 * # sum
 *
 * Returns the sum of a given array of numbers.
 *
 * @param {Array} numbers to sum
 * @returns sum
 */

exports.sum = function (nums) {
  var res = 0;
  for (var i = 0; i < nums.length; i++)
    res += nums[i];
  return res;
};

/**
 * # mean
 *
 * Returns the mean (average) of a given array of numbers.
 *
 * @param {Array} numbers to average
 * @returs mean
 */

exports.mean = function (nums) {
  var sum = exports.sum(nums);
  return sum / nums.length;
};

/**
 * # sdeviation
 *
 * Returns the standard deviation of a given array of numbers.
 *
 * @param {Array} numbers for stdev
 * @return standard deviation
 */

exports.sdeviation = function (nums) {
  var devs = []
    , mean = exports.mean(nums);
  for (var i = 0; i < nums.length; i++)
    devs.push(nums[i] - mean);
  for (var d = 0; d < devs.length; d++)
    devs[d] = Math.pow(devs[d], 2);
  var davg = exports.sum(devs) / (devs.length - 1);
  return Math.sqrt(davg);
};

function tolerance(precision){
  if(precision == null) precision = 7;
  return 0.5 * Math.pow(10, -precision);
}

/**
 *
 * # almostEqual
 *
 * Returns true if the two arguments are equal within the given precision.
 *
 * @param {Number} a
 * @param {Number} b
 * @param {Number} precision. Optional: defaults to 7.
 * @return {Boolean} true if the two arguments are equal with precision decimal places.
 *
 */

exports.almostEqual = function (a,b,precision){
  return Math.abs(a - b) < tolerance(precision);
};

/**
 *
 * # deepAlmostEqual
 *
 * Returns true if all the objects are deeply equal, within the given precision.
 *
 * @param {Object} a
 * @param {Object} b
 * @param {Number} precision. Optional: defaults to 7.
 * @return {Boolean} true if the two arguments are deeply equal with precision decimal places.
 */

exports.deepAlmostEqual = function(a,b,precision){
  var tol = tolerance(precision);
  function deepEql (act, exp) {
    if (Object(act) === act){
      for (var k in act) {
        if (!(deepEql(act[k], exp[k]))) {
          return false;
        }
      }
      return true;
    } else {
      return Math.abs(act - exp) < tol;
    }
  }

  return deepEql(a,b);
};

}); // module calc


require.register("stats", function (module, exports, require) {
var calc = require('./calc');

module.exports = function (chai, _) {
  var Assertion = chai.Assertion
    , flag = _.flag

  Assertion.addProperty('almost', function () {
    flag(this, 'almost', true);
  });

  /**
   * # .almost.equal(expected, [precision])
   *
   * The same as NumPy's assert_almost_equal, for scalars.
   * Assert near equality: abs(expected-actual) < 0.5 * 10**(-decimal)
   *
   *      expect(3.1415).to.almost.equal(3.14159, 3);
   *      assert.almostEqual(3.1416, 3.14159, 3, 'these numbers are almost equal');
   *
   * @name equal
   * @param {Number} actual
   * @param {Number} expected
   * @param {Number} decimal
   * @param {String} message
   * @api public
   */

  Assertion.overwriteMethod('equal', function(_super) {
    return function equal (exp, precision) {
      if (flag(this, 'almost')) {
        var act = flag(this, 'object');
        if(precision == null) precision = 7;
        this.assert(
            calc.almostEqual(exp,act,precision)
          , "expected #{this} to equal #{exp} up to " + _.inspect(precision) + " decimal places"
          , "expected #{this} to not equal #{exp} up to " + _.inspect(precision) + " decimal places"
          , exp
          , act
        );
      } else {
        _super.apply(this, arguments);
      }
    };
  });

  _.addMethod(chai.assert, 'almostEqual', function (act, exp, precision, msg) {
    new Assertion(act, msg).to.almost.equal(exp, precision);
  });

  /**
   * # .deepAlmostEqual(actual, expected, [decimal, message])
   *
   * The same as NumPy's assert_almost_equal, for objects whose leaves are all numbers.
   * Assert near equality: abs(expected-actual) < 0.5 * 10**(-decimal) for every leaf.
   *
   *      assert.deepAlmostEqual({pi: 3.1416}, {pi: 3.14159}, 3);
   *
   * @name equal
   * @param {*} actual
   * @param {*} expected
   * @param {Number} decimal
   * @param {String} message
   * @api public
   */

  Assertion.overwriteMethod('eql', function (_super) {
    return function eql (exp, precision) {
      if (flag(this, 'almost')) {
        var act = flag(this, 'object') ;
        if(precision == null) precision = 7;
        this.assert(
            calc.deepAlmostEqual(act,exp,precision)
          , "expected #{this} to equal #{exp} up to " + _.inspect(precision) + ' decimal places'
          , "expected #{this} to not equal #{exp} up to " + _.inspect(precision) + ' decimal places'
          , exp
          , act
        );
      } else {
        _super.apply(this, arguments);
      }
    };
  });

  _.addMethod(chai.assert, 'deepAlmostEqual', function (act, exp, precision, msg) {
    new Assertion(act, msg).to.almost.eql(exp, precision);
  });

  /**
   * ### .sum
   *
   * Modifies the assertion subject with the sum of an
   * array of number so it can be compared using chai's
   * core assertions.
   *
   *     expect([ 1, 2, 3 ]).to.have.sum.equal(6);
   *     expect([ 1, 2, 3 ]).to.have.sum.above(5);
   *     expect([ 1, 2, 3 ]).to.have.sum.below(7);
   *
   * @name sum
   * @expects {Array}
   * @api public
   */

  Assertion.addProperty('sum', function () {
    var obj = flag(this, 'object');
    new Assertion(obj).to.be.instanceOf(Array);
    flag(this, 'object', calc.sum(obj));
  });

  /**
   * ### .mean
   *
   * Modifies the assertion subject with the mean of an
   * array of number so it can be compared using chai's
   * core assertions.
   *
   *     expect([ 1, 2, 3 ]).to.have.mean.equal(2);
   *     expect([ 1, 2, 3 ]).to.have.mean.above(1.5);
   *     expect([ 1, 2, 3 ]).to.have.mean.below(2.5);
   *
   * @name mean
   * @expects {Array}
   * @api public
   */

  Assertion.addProperty('mean', function () {
    var obj = flag(this, 'object');
    new Assertion(obj).to.be.instanceOf(Array);
    flag(this, 'object', calc.mean(obj));
  });

  function deviation () {
    var obj = flag(this, 'object');
    new Assertion(obj).to.be.instanceOf(Array);
    flag(this, 'object', calc.sdeviation(obj));
  }

  /**
   * ### .deviation
   *
   * Modifies the assertion subject with the standard
   * deviations of an array of number so it can be
   * compared using chai's core assertions.
   *
   *     expect([ 1, 2, 3, 4 ]).to.have.deviation.almost.equal(1.290, 2);
   *
   * @name mean
   * @expects {Array}
   * @api public
   */

  Assertion.addProperty('stdev', deviation);
  Assertion.addProperty('deviation', deviation);
};

for(var i in calc){
  if(calc.hasOwnProperty(i)){
    module.exports[i] = calc[i];
  }
}
}); // module stats
  return require('stats');
});

chai.use(chai_stats);
