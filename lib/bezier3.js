module.exports = (function() {

  var utils = require("./utils");
  var Bezier = require("./bezier");
  var Bezier2 = require("./bezier2");
  var Bezier3 = function(args, _3d) { Bezier.call(this, args, _3d); }
  Bezier3.prototype = new Bezier();
  Bezier3.prototype.constructor = Bezier3;

  /**
   * Cubic Bezier computation function
   */
  Bezier3.prototype.compute = function(t) {
    if(t===0) { return this.points[0]; }
    if(t===1) { return this.points[2]; }
    var mt = 1-t, mt2 = mt*mt, mt3 = mt2*mt, t2 = t*t, t3 = t2*t,
        a = mt3, b = mt2*t*3, c = mt*t2*3, d = t3,
        p = this.points, p0 = p[0], p1 = p[1], p2 = p[2], p3 = p[3],
        ret = {};
    ret.x = a*p0.x + b*p1.x + c*p2.x + d*p3.x;
    ret.y = a*p0.y + b*p1.y + c*p2.y + d*p3.y;
    if(this._3d) { ret.z = a*p0.z + b*p1.z + c*p2.z + d*p3.z; }
    return ret;
  };

  /**
   * Cubic Bezier derivative (= quadratic)
   */
  Bezier3.prototype.derivative =  function(t) {
    if(!this.cache.d[0]) {
      console.log("what?", this.cache.d)
    }

    var mt = 1-t, mt2 = mt * mt, t2 = t*t,
        p = this.cache.d[0], p0 = p[0], p1 = p[1], p2 = p[2],
        a = mt2, b = mt*t*2, c = t2,
        ret = {};
    ret.x = a*p0.x + b*p1.x + c*p2.x;
    ret.y = a*p0.y + b*p1.y + c*p2.y;
    if(this._3d) { ret.z = a*p0.z + b*p1.z + c*p2.z; }
    return ret;
  };

  /**
   * A Cubic curve is raised to a quartic at which point we just go with generic curve.
   */
  Bezier3.prototype.raise = function() {
    var p = this.points,
        np = [p[0], {}, {}, {}, p[3]],
        r = 1/4,
        m = 2/4,
        R = 3/4;
    np[1].x = r * p[0].x + R * p[1].x;
    np[1].y = r * p[0].y + R * p[1].y;
    if(this._3d) {
    np[1].z = r * p[0].z + R * p[1].z;
    }
    np[2].x = m * p[1].x + m * p[2].x;
    np[2].y = m * p[1].y + m * p[2].y;
    if(this._3d) {
    np[2].z = m * p[1].z + m * p[2].z;
    }
    np[3].x = R * p[2].x + r * p[3].x;
    np[3].y = R * p[2].y + r * p[3].y;
    if(this._3d) {
    np[3].z = R * p[1].z + r * p[3].z;
    }
    return new Bezier(np);
  };

  /**
   * A cubic span requires six coordinate interpolations.
   */
  Bezier3.prototype.span = function(t) {
    var span = this.points.slice();
    span.push(utils.lerp(t,span[0],span[1]));
    span.push(utils.lerp(t,span[1],span[2]));
    span.push(utils.lerp(t,span[2],span[3]));
    span.push(utils.lerp(t,span[4],span[5]));
    span.push(utils.lerp(t,span[5],span[6]));
    span.push(utils.lerp(t,span[7],span[8]));
    return span;
  };

  /**
   * Split a curve into two sections.
   */
  Bezier3.prototype._split = function(t) {
    var span = this.span(t);
    return {
      left: new Bezier3([span[0], span[4], span[7], span[9]]),
      right: new Bezier3([span[9], span[8], span[6], span[3]])
    };
  };

  /**
   * Extract a section between two t values.
   */
  Bezier3.prototype._section = function(t, t2) {
    var span = this.span(t);
    t = utils.map(t2,t,1,0,1);
    var p10 = utils.lerp(t,span[9],span[8]);
    var p11 = utils.lerp(t,span[8],span[6]);
    var p12 = utils.lerp(t,span[6],span[3]);
    var p13 = utils.lerp(t,p10,p11);
    var p14 = utils.lerp(t,p11,p12);
    var p15 = utils.lerp(t,p13,p14);
    return new Bezier3([span[9],p10,p13,p15]);
  };

  /**
   * The points of interest for a cubic Bezier curve are
   * the roots of the first derivative for each dimension,
   * as well as the roots for the second derivative for
   * each dimension.
   */
  Bezier3.prototype.inflections =  function() {
    if(!this.cache.inflections) {
      var d = this.cache.d[0], d0=d[0], d1=d[1], d2=d[2];
      // first deriative
      var roots = [], result={x:[], y:[]}, _;
      if(this._3d) result.z = [];
      result.x = utils.droots(d0.x, d1.x, d2.x);
      if(result.x.length>0) roots = roots.concat(result.x);
      result.y = utils.droots(d0.y, d1.y, d2.y);
      if(result.y.length>0) roots = roots.concat(result.y);
      if(this._3d) {
      result.z = utils.droots(d0.z, d1.z, d2.z);
      if(result.z.length>0) roots = roots.concat(result.z);
      }
      // second derivative;
      var _;
      d = this.cache.d[1];
      d0 = d[0];
      d1 = d[1];
      _ = utils.droots(d0.x, d1.x);
      if(_.length>0) { roots.push(_[0]); result.x.push(_[0]); }
      _ = utils.droots(d0.y, d1.y);
      if(_.length>0) { roots.push(_[0]); result.y.push(_[0]); }
      if(this._3d) {
      _ = utils.droots(d0.z, d1.z);
      if(_.length>0) { roots.push(_[0]); result.z.push(_[0]); }
      }
      result.values = roots.filter(function(v) { return 0<=v && v<=1; }).sort();
      this.cache.inflections = result;
    }
    return this.cache.inflections;
  };

  /**
   * Scale a curve relative to its offset origin.
   */
  Bezier3.prototype.scale = function(d1, d2) {
    console.error("not implemented yet");
    return this;
  };

  /**
   * Generate the SVG path for this curve
   */
  Bezier3.prototype.toSVG = function(origin) {
    return this._toSVG("C", origin);
  };

  return Bezier3;
}());
