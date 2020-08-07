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
