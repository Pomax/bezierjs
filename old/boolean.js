/**
 * Boolean operator, acting on two (assumed closed) polybezier outlines.
 */
module.exports = (function() {
  "use strict";

  var utils = require("./utils");
  var PolyBezier = require("./polybezier");
  var record = require("./record");

  var Boolean = function(p1, p2) {
    record(this);
    // get intersections for resolution
    var resolve = this.intersections = {};
    p1.intersects(p2).forEach(function(pair) {
      if(!resolve[pair[0].curve.id]) { resolve[pair[0].curve.id] = []; }
      resolve[pair[0].curve.id].push({t: pair[0].t, other: pair[1].curve });
      if(!resolve[pair[1].curve.id]) { resolve[pair[1].curve.id] = []; }
      resolve[pair[1].curve.id].push({t: pair[1].t, other: pair[0].curve });
    });
    this.p1 = p1;
    this.p2 = p2;
    this.curves = p1.curves.concat(p2.curves);
  };

  Boolean.prototype = {
    union: function() {
      var resolve = this.intersections;
      Object.keys(resolve).forEach(function(id) {
        var list = resolve[id];
        list.forEach(function(entry) {
          console.log( id + " @ " + entry.t + " -> " + entry.other.id );
        });
      });
      return new PolyBezier(this.curves);
    },
    intersections: function() {

    },
    exclusion: function() {

    }
  };

  return Boolean;
}());
