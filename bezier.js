/**
  A javascript Bezier curve library by Pomax.

  Based on http://pomax.github.io/bezierinfo

  This code is public domain because it's been over fifty years,
  anyone can implement this library from scratch if they actually
  wanted to.

  If you live in a country that doesn't recognise the public
  domain, this code is MIT licensed. Also your country has a
  terribly legal system where my disclaim is not respected.
**/
(function() {
  "use strict";

  var utils = (function() {
    if(typeof module !== "undefined" && module.exports && typeof require !== "undefined")
      return require("./bezierutils");
    if(typeof window !== "undefined" && window.BezierUtils)
      return window.BezierUtils;
    throw "We don't have BezierUtils available, so I'm giving up.";
   }());

  /**
   * Bezier curve constructor. The constructor argument can be one of three things:
   *
   * 1. array/4 of {x:..., y:..., z:...}, z optional
   * 2. numerical array/8 ordered x1,y1,x2,y2,x3,y3,x4,y4
   * 3. numerical array/12 ordered x1,y1,z1,x2,y2,z2,x3,y3,z3,x4,y4,z4
   *
   */
  var Bezier = function(coords) {
    var args = (coords && coords.forEach ? coords : arguments);
    if(typeof args[0] === "object") {
      args = [];
      for(var i=0; i<coords.length; i++) {
        ['x','y','z'].forEach(function(d) {
          if(typeof coords[i][d] !== "undefined") {
            args.push(coords[i][d]);
          }
        });
      }
    }
    var len = args.length;
    if(len!==8 && len!==12) {
      throw new Error("Not a cubic curve");
    }
    var _3d = (len % 3 === 0);
    this._3d = _3d;
    var points = [];
    for(var idx=0, step=(_3d?3:2); idx<len; idx+=step) {
      var point = {
        x: args[idx],
        y: args[idx+1],
        z: 0
      };
      if(_3d) point.z = args[idx+2];
      points.push(point);
    }
    this.order = points.length - 1;
    this.points = points;
    var dims = ['x','y'];
    if(this._3d) dims.push('z');
    this.dims = dims;
    this.dimlen = dims.length;
    this._t1 = 0;
    this._t2 = 1;
  };


  /**
   * Bezier curve prototype. API:
   *
   * 1.   length() yields the curve's arc length in pixels.
   * 2.   getLUT(steps) yields array/steps of {x:..., y:..., z:...} coordinates.
   * 3.   get(t) alias for compute(t).
   * 4.   compute(t) yields the curve coordinate at 't'.
   * 5.   derivative(t) yields the curve derivative at 't' as vector.
   * 6.   normal(t) yields the normal vector for the curve at 't'.
   * 7a.  split(t) split the curve at 't' and return both segments as new curves.
   * 7b.  split(t1,t2) split the curve between 't1' and 't2' and return the segment as new curve.
   * 8.   inflections() yields all known inflection points on this curve.
   * 9.   offset(t, d) yields a coordinate that is a point on the curve at 't',
   *                 offset by distance 'd' along its normal.
   * 10.   reduce() yields an array of 'simple' curve segments that model the curve as poly-simple-beziers.
   * 11.  scale(d) yields the curve scaled approximately along its normals by distance 'd'.
   * 12a. outline(d) yields the outline coordinates for the curve offset by 'd' pixels on either side,
   *                 encoded as as an object of form {"+":[p,...], "-":[p,...]}, where each point
   *                 'p' is of the form {p: {x:..., y:..., z:...}, c: true/false}. z is optional,
   *                 and c:true means on-curve point, with c:false means off-curve point.
   * 12b. outline(d1,d2) yields the outline coordinates for the curve offset by d1 on its normal, and
   *                     d2 on its opposite side.
   *
   */
  Bezier.prototype = {
    length: function() {
      return utils.length(this.points);
    },
    getLUT: function(steps) {
      var points = [];
      for(var t=0, step=1/steps; t<=1+step; t+=step) {
        points.push(this.compute(t));
      }
      return points;
    },
    get: function(t) {
      return this.compute(t);
    },
    point: function(idx) {
      return this.points[idx];
    },
    compute: function(t) {
      if(t===0) { return this.points[0]; }
      if(t===1) { return this.points[3]; }
      var dims=this.dims,len=this.dimlen,i,dim,result={};
      for(i=len-1; i>-1;i--) {
        dim = dims[i];
        result[dim] = utils.computeDim(this.points,dim,t);
      }
      if(!result.z) result.z=0;
      return result;
    },
    derivative: function(t) {
      var dims=this.dims,len=this.dimlen,i,dim,result={};
      for(i=len-1; i>-1;i--) {
        dim = dims[i];
        result[dim] = utils.derivativeDim(this.points, dim,t);
      }
      return result;
    },
    normal: function(t) {
      return this._3d ? this.__normal3(t) : this.__normal2(t);
    },
    __normal2: function(t) {
      var d = this.derivative(t);
      var q = Math.sqrt(d.x*d.x + d.y*d.y)
      return { x: -d.y/q, y: d.x/q, z: 0 };
    },
    __normal3: function() {
      // see http://stackoverflow.com/questions/25453159
      var r1 = this.derivative(t),
          r2 = this.derivative(t+0.01),
          q1 = Math.sqrt(r1.x*r1.x + r1.y*r1.y + r1.z*r1.z),
          q2 = Math.sqrt(r2.x*r2.x + r2.y*r2.y + r2.z*r2.z);
      r1.x /= q1; r1.y /= q1; r1.z /= q1;
      r2.x /= q2; r2.y /= q2; r2.z /= q2;
      // cross product
      var c = {
        x: r2.y*r1.z - r2.z*r1.y,
        y: r2.z*r1.x - r2.x*r1.z,
        z: r2.x*r1.y - r2.y*r1.x
      };
      var m = Math.sqrt(c.x*c.x + c.y*c.y + c.z*c.z);
      c.x /= m; c.y /= m; c.z /= m;
      // rotation matrix
      var R = [   c.x*c.x,   c.x*c.y-c.z, c.x*c.z+c.y,
            c.x*c.y+c.z,   c.y*c.y,   c.y*c.z-c.x,
            c.x*c.z-c.y, c.y*c.z+c.x,   c.z*c.z    ];
      // normal vector:
      var n = {
        x: R[0] * r1.x + R[1] * r1.y + R[2] * r1.z,
        y: R[3] * r1.x + R[4] * r1.y + R[5] * r1.z,
        z: R[6] * r1.x + R[7] * r1.y + R[8] * r1.z
      };
      return n;
    },
    split: function(t1, t2) {
      // shortcuts
      if(t1===0 && !!t2) { return this.split(t2)[0]; }
      if(t2===1) { return this.split(t1)[1]; }
      // split on t1 first, regardless of whether there's a t2
      var dims=this.dims,len=this.dimlen,i,dim,result={};
      for(i=len-1; i>-1;i--) {
        dim = dims[i];
        result[dim] = utils.splitDim(this.points,dim,t1);
      }
      var args, j, idx, curves = [], segment;
      for(i=0; i<2; i++) {
        args = [];
        for(idx=0; idx<4;idx++) {
          for(j=0; j<len; j++) {
            dim = dims[j]
            args.push(result[dim][i][idx])
          }
        }
        segment = new Bezier(args);
        segment._t1 = utils.map(i===0 ? 0:t1, 0,1, this._t1,this._t2);
        segment._t2 = utils.map(i===0 ? t1:1, 0,1, this._t1,this._t2);
        curves.push(segment);
      }
      // if we have a t2, split again:
      if(t2) {
        t2 = utils.map(t2,t1,1,0,1);
        curves = curves[1].split(t2);
        return curves[0];
      }
      return curves;
    },
    inflections: function() {
      var dims=this.dims,len=this.dimlen,i,dim,p,result={},roots=[];
      for(i=len-1; i>-1;i--) {
        dim = dims[i];
        p = this.points.map(function(v) { return v[dim]; });
        // get all iflection points along the curvature
        result[dim] = utils.rootsd1(p).concat(utils.rootsd2(p));
        // filter out t<0 and t>1 values
        result[dim] = result[dim].filter(function(v) { return (v>=0 && v<=1); });
        roots = roots.concat(result[dim].sort());
      }
      roots.sort();
      result.values = roots;
      return result;
    },
    bbox: function() {
      var inflections = this.inflections(), result = {};
      ['x','y','z'].forEach(function(d) {
        result[d] = utils.getminmax(this, d, inflections[d]);
      }.bind(this));
      return result;
    },
    overlaps: function(curve) {
      var lbbox = this.bbox(),
          tbbox = curve.bbox();
      return utils.bboxoverlap(lbbox,tbbox);
    },
    offset: function(t, d) {
      var c = this.get(t);
      var n = this.normal(t);
      return {
        c: c,
        n: n,
        x: c.x + n.x * d,
        y: c.y + n.y * d,
        z: c.z + n.z * d,
      };
    },
    simple: function() {
      var n1 = this.normal(0);
      var n2 = this.normal(1);
      var s = n1.x*n2.x + n1.y*n2.y + n1.z*n2.z;
      var angle = Math.abs(Math.acos(s));
      return angle < Math.PI/3;
    },
    reduce: function() {
      var i, t1=0, t2=0, step=0.01, segment, pass1=[], pass2=[];
      // first pass: split on inflections
      var inflections = this.inflections().values;
      if(inflections.indexOf(0)===-1) { inflections = [0].concat(inflections); }
      if(inflections.indexOf(1)===-1) { inflections.push(1); }
      for(t1=inflections[0], i=1; i<inflections.length; i++) {
        t2 = inflections[i];
        segment = this.split(t1,t2);
        segment._t1 = t1;
        segment._t2 = t2;
        pass1.push(segment);
        t1 = t2;
      }
      // second pass: further reduce these segments to simple segments
      pass1.forEach(function(p1) {
        t1=0;
        t2=0;
        while(t2 <= 1) {
          for(t2=t1+step; t2<=1+step; t2+=step) {
            segment = p1.split(t1,t2);
            if(!segment.simple()) {
              t2 -= step;
              if(Math.abs(t1-t2)<step) {
                // we can never form a reduction
                return [];
              }
              segment = p1.split(t1,t2);
              segment._t1 = utils.map(t1,0,1,p1._t1,p1._t2);
              segment._t2 = utils.map(t2,0,1,p1._t1,p1._t2);
              pass2.push(segment);
              t1 = t2;
              break;
            }
          }
        }
        if(t1<1) {
          segment = p1.split(t1,1);
          segment._t1 = utils.map(t1,0,1,p1._t1,p1._t2);
          segment._t2 = p1._t2;
          pass2.push(segment);
        }
      });
      return pass2;
    },
    scale: function(d) {
      var v = [ this.offset(0,10), this.offset(1,10) ];
      var o = utils.lli(v[0],v[1]);
      if(!o) { throw "cannot scale this curve. Try reducing it first."; }
      // move all points by distance 'd' wrt the origin 'o'
      var points=this.points,np=[],p;
      // move end points by fixed distance along normal.
      [0,1].forEach(function(t) {
        var p = np[t*3] = utils.copy(points[t*3]);
        p.x += d * v[t].n.x;
        p.y += d * v[t].n.y;
      }.bind(this));
      // move control points by "however much necessary to ensure
      // the correct tangent to endpoint".
      [0,1].forEach(function(t) {
        var d = this.derivative(t);
        var x = np[t*3].x;
        var y = np[t*3].y;
        var ls = { x: x, y: y, c: { x: x + d.x, y: y + d.y }};
        o.c = points[t+1];
        var o2 = utils.lli(ls, o);
        np[t+1] = o2;
      }.bind(this));
      return new Bezier(np);
    },
    outline: function(d1, d2) {
      d2 = d2 || d1;
      var reduced = this.reduce();
      var scaled = { "-": [], "+": [] };
      reduced.forEach(function(segment) {
        scaled["+"].push(segment.scale(d1));
        scaled["-"].push(segment.scale(-d2));
      });
      var coords = { "-": [], "+": [] }, i, last, segment, points;
      for(i=0, last=scaled["+"].length; i<last; i++) {
        segment = scaled["+"][i];
        points = segment.points;
        coords["+"].push({ p: points[0], c: true });
        coords["+"].push({ p: points[1], c: false });
        coords["+"].push({ p: points[2], c: false });
      }
      coords["+"].push({ p: scaled["+"][last-1].points[3], c: true });
      for(i=i-1; i>=0; i--) {
        segment = scaled["-"][i];
        points = segment.points;
        coords["-"].push({ p: points[3], c: true });
        coords["-"].push({ p: points[2], c: false });
        coords["-"].push({ p: points[1], c: false });
      }
      coords["-"].push({ p: scaled["-"][0].points[0], c: true });
      return coords;
    },
    intersects: function(curve) {
      if(!curve) return this.selfintersects();
      if(curve instanceof Bezier) { curve = curve.reduce(); }
      return this.curveintersects(this.reduce(), curve);
    },
    selfintersects: function() {
      var reduced = this.reduce();
      // "simple" curves cannot intersect with their direct
      // neighbour, so for each segment X we check whether
      // it intersects [0:x-2][x+2:last].
      var i,len=reduced.length-2,results=[],result,left,right;
      for(i=0; i<len; i++) {
        left = reduced.slice(i,i+1);
        right = reduced.slice(i+2);
        result = this.curveintersects(left, right);
        results = results.concat( result );
      }
      return results;
    },
    curveintersects: function(c1,c2) {
      var pairs = [];
      // step 1: pair off any overlapping segments
      c1.forEach(function(l) {
        c2.forEach(function(r) {
          if(l.overlaps(r)) {
            pairs.push({ left: l, right: r });
          }
        });
      });
      // step 2: for each pairing, run through the convergence algorithm.
      var intersections = [];
      pairs.forEach(function(pair) {
        var result = utils.pairiteration(pair.left, pair.right);
        if(result.length > 0) {
          intersections = intersections.concat(result);
        }
      });
      return intersections;
    }
  };

  // node bindings
  if (typeof module !== "undefined" && module.exports) {
    module.exports = Bezier;
  }

  // browser bindings
  else if (typeof window !== "undefined") {
    window.Bezier = Bezier;
  }

}());
