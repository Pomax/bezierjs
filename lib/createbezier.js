module.exports = (function() {
  "use strict";

  // the various bezier types. Separate objects,
  // as different types can be optimized differently.
  var Bezier  = require("./bezier");
  var Bezier2 = require("./bezier2");
  var Bezier3 = require("./bezier3");

  function createBezier() {
    var args = Array.prototype.slice.call(arguments);
    if(args.length === 6) { return new Bezier2(args, false); }
    else if(args.length === 8) { return new Bezier3(args, false); }
    else { return new Bezier(args, false); }
  };

  function createBezier3D() {
    var args = Array.prototype.slice.call(arguments);
    if(args.length === 9) { return new Bezier2(args, true); }
    else if(args.length === 12) { return new Bezier3(args, true); }
    else { return new Bezier(args, true); }
  };

  return {
    create: createBezier,
    create3D: createBezier3D
  };

}());
