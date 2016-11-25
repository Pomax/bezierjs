require('./lib/assign-polyfill');
// Solve cross-dependencies between bezier.js and utils.js
var _utils   = {};
var _bezier  = {};
var Bezier   = require('./lib/bezier.js')(_utils);
var utils    = require('./lib/utils.js')(_bezier);
var BezierFP = require('./lib/bezier.fp.js')(_utils);
var utilsFP  = require('./lib/utils.fp.js')(_bezier);

Object.assign(_utils, utils, utilsFP);
Object.assign(_bezier, Bezier, BezierFP);

module.exports = _bezier;
