module.exports = (function() {

  var utils = require("./utils");
  var Bezier = require("./bezier");
  var Bezier2 = function(args, _3d) { Bezier.call(this, args, _3d); }
  Bezier2.prototype = new Bezier();
  Bezier2.prototype.constructor = Bezier2;
  var Bezier3 = require("./bezier3");

  /**
   * Quadratic Bezier computation function
   */
  Bezier2.prototype.compute = function(t) {
    if(t===0) { return this.points[0]; }
    if(t===1) { return this.points[2]; }
    var mt = 1-t, mt2 = mt*mt, t2 = t*t,
        a = mt2, b = mt*t*2, c = t2,
        p = this.points, p0 = p[0], p1 = p[1], p2 = p[2],
        ret = {};
    ret.x = a*p0.x + b*p1.x + c*p2.x;
    ret.y = a*p0.y + b*p1.y + c*p2.y;
    if(this._3d) { ret.z = a*p0.z + b*p1.z + c*p2.z; }
    return ret;
  };

  /**
   * Quadratic Bezier derivative (= lerp)
   */
  Bezier2.prototype.derivative =  function(t) {
    var mt = 1-t,
        p = this.cache.d[0], p0 = p[0], p1 = p[1];
        ret = {};
    ret.x = mt*p0.x + t*p1.x;
    ret.y = mt*p0.y + t*p1.y;
    if(this._3d) { ret.z = mt*p0.z + t*p1.z; }
    return ret;
  };

  /**
   * A quadratic curve is raised to cubic.
   */
  Bezier2.prototype.raise = function() {
    var p = this.points,
        np = [p[0], {}, {}, p[2]],
        r = 1/3,
        R = 2/3;
    np[1].x = r * p[0].x + R * p[1].x;
    np[1].y = r * p[0].y + R * p[1].y;
    if(this._3d) {
    np[1].z = r * p[0].z + R * p[1].z;
    }
    np[2].x = R * p[1].x + r * p[2].x;
    np[2].y = R * p[1].y + r * p[2].y;
    if(this._3d) {
    np[2].z = R * p[1].z + r * p[2].z;
    }
    return new Bezier3(np);
  };

  /**
   * A quadratic span requires three coordinate interpolations.
   */
  Bezier2.prototype.span = function(t) {
    var span = this.points.slice();
    span.push(utils.lerp(t,span[0],span[1]));
    span.push(utils.lerp(t,span[1],span[2]));
    span.push(utils.lerp(t,span[3],span[4]));
    return span;
  };

  /**
   * Split a curve into two sections.
   */
  Bezier2.prototype._split = function(t, t2) {
    var span = this.span(t);
    return {
      left: new Bezier2([span[0], span[3], span[5]]),
      right: new Bezier2([span[5], span[4], span[2]])
    };
  };

  /**
   * Extract a section between two t values.
   */
  Bezier2.prototype._section = function(t, t2) {
    var span = this.span(t);
    t = utils.map(t2,t,1,0,1);
    var p6 = utils.lerp(t,span[5],span[4]);
    var p7 = utils.lerp(t,span[4],span[2]);
    var p8 = utils.lerp(t,p6,p7);
    return new Bezier2([span[5],p6,p8]);
  };

  /**
   * The points of interest for a quadratic Bezier curve are
   * simply the roots of the first derivative for each dimension.
   */
  Bezier2.prototype.inflections =  function() {
    if(!this.cache.inflections) {
      var d = this.cache.d[0], d0=d[0], d1=d[1];
      var roots = [], result={};
      result.x = utils.droots(d0.x, d1.x);
      if(result.x.length>0) roots.push(result.x[0]);
      result.y = utils.droots(d0.y, d1.y);
      if(result.y.length>0) roots.push(result.y[0]);
      if(this._3d) {
      result.z = utils.droots(d0.z, d1.z);
      if(result.z.length>0) roots.push(result.z[0]);
      }
      result.values = roots.filter(function(v) { return 0<=v && v<=1; }).sort();
      this.cache.inflections = result;
    }
    return this.cache.inflections;
  };

  /**
   * Scale a curve relative to its offset origin.
   */
  Bezier2.prototype.scale = function(d1, d2) {
    console.error("not implemented yet");
    return this;
  };

  /**
   * Generate the SVG path for this curve
   */
  Bezier2.prototype.toSVG = function(origin) {
    return this._toSVG("Q", origin);
  };

  return Bezier2;
}());
