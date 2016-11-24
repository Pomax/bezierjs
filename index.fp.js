// Solve cross-dependencies between bezier.js and utils.js
var _utils   = {};
var Bezier   = require('./lib/bezier.js')(_utils);
var utils    = require('./lib/utils.js')(Bezier);
var BezierFP = require('./lib/bezier.fp.js')(_utils);
var utilsFP  = require('./lib/utils.fp.js')(Bezier);

Object.assign(_utils, utils, utilsFP);
Object.assign(Bezier, BezierFP);

module.exports = Bezier;
