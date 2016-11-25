require('./lib/assign-polyfill');
// Solve cross-dependencies between bezier.js and utils.js
var _utils   = {};
var Bezier   = require('./lib/bezier.js')(_utils);
var utils    = require('./lib/utils.js')(Bezier);

Object.assign(_utils, utils);

module.exports = Bezier;
