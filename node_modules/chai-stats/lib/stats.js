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