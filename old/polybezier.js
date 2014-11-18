module.exports = (function() {
  "use strict";

  var record = require("./record");
  var utils = require("./utils");

  var PolyBezier = function(curves) {
    record(this);
    this.curves = [];
    this._3d = false;
    if(!!curves) {
      this.curves = curves;
      // form linked list
      for(var i=0, last=curves.length, cur, next; i<last; i++) {
        cur = curves[i];
        next = curves[(i+1)%last];
        cur.next = next;
        next.prev = cur;
      }
      this._3d = this.curves[0]._3d;
    }
  }

  PolyBezier.prototype = {
    valueOf: function() {
      return this.toString();
    },
    toString: function() {
      return utils.pointsToString(this.points);
    },
    addCurve: function(curve) {
      this._3d = this._3d || curve._3d;
      var next = this.curves[0],
          prev = this.curves[this.curves.length-1];
      this.curves.push(curve);
      // link up with "prev" curve
      curve.prev = prev;
      prev.next = curve;
      // link up with "next" curve
      curve.next = next;
      next.prev = curve;
    },
    replaceCurve: function(curve, curves) {
      var idx = this.curves.indexOf(curve);
      var c = this.curves;
      c = c.slice(0,idx).concat(curves).concat(c.slice(idx+1));
      for(var i=idx, len=c.length, last=idx+curves.length+1, cur, prev; i<last; i++) {
        cur = c[i];
        prev = c[(len+i-1)%len];
        cur.prev = prev;
        prev.next = cur;
      }
    },
    length: function() {
      return this.curves.map(function(v) { return v.length(); }).reduce(function(a,b) { return a+b; });
    },
    curve: function(idx) {
      return this.curves[idx];
    },
    bbox: function() {
      var c = this.curves;
      var bbox = c[0].bbox();
      for(var i=1; i<c.length; i++) {
        utils.expandbox(bbox, c[i].bbox());
      }
      return bbox;
    },
    offset: function(d) {
      var offset = [];
      this.curves.forEach(function(v) {
        offset = offset.concat(v.offset(d));
      });
      return new PolyBezier(offset);
    },
    intersects: function(target) {
      var intersections = [];
      var aggregate = function(c) {
            var ts = c.intersects(target);
            if(ts.length>0) {
              ts.forEach(function(ts) {
                ts = ts.split("/");
                intersections.push([
                  { curve: c, t: ts[0] },
                  { curve: target, t: ts[1] }
                ]);
              });
            }
          };
      var self = this;
      if(target instanceof PolyBezier) {
        var tcurves = target.curves;
        tcurves.forEach(function(tc) {
          target = tc;
          self.curves.forEach(aggregate);
        });
      } else { this.curves.forEach(aggregate); }
      return intersections;
    },
    contains: function(curve) {
      var bbox = this.bbox(),
          origin = {
            x: bbox.x.min - bbox.x.size,
            y: bbox.y.min - bbox.y.size
          },
          intersections = 0,
          midpoint = curve.get(0.5),
          line = { p1: origin, p2: midpoint };
      this.curves.forEach(function(c) {
        var tvals = c.intersects(line);
        intersections += tvals.length;
      });
      return intersections%2===1;
    }
  };

  return PolyBezier;
}());
