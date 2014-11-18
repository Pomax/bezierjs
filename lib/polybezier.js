module.exports = (function() {

  var utils = require("./utils");
  var Bezier = require("./bezier");

  var PolyBezier = function() {
    this.curves = [];
    this.arclength = false;
  };

  PolyBezier.prototype = {
    add: function(c) {
      this.curves.push(c);
      this.arclength = false;
    },
    length: function() {
      if(!this.arclength) {
        var len = 0;
        this.curves.forEach(function(c) {
          len += c.length();
        });
        this.arclength = len;
      }
      return this.arclength;
    },
    toString: function() {
      return this.curves.map(function(c) {
        return c.points;
      });
    }
  };

  return PolyBezier;
}());
