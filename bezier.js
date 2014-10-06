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

  // utility function: map number from one domain to another
  var map = function(v, ds,de, ts,te) {
    var d1 = de-ds, d2 = te-ts, v2 =  v-ds, r = v2/d1;
    return ts + d2*r;
  };

  // utility function: copy objects
  var copy = function(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  // utility function: compute a line/line intersection coordinate
  var lli = function(v1, v2) {
    var x1=v1.c.x, y1=v1.c.y,
        x2=v1.x, y2=v1.y,
        x3=v2.c.x,y3=v2.c.y,
        x4=v2.x,y4=v2.y,
        nx=(x1*y2-y1*x2)*(x3-x4)-(x1-x2)*(x3*y4-y3*x4),
        ny=(x1*y2-y1*x2)*(y3-y4)-(y1-y2)*(x3*y4-y3*x4),
        d=(x1-x2)*(y3-y4)-(y1-y2)*(x3-x4);
    if(d==0) { return false; }
    return { x: nx/d, y: ny/d, z: 0 };
  };

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
          if(coords[i][d]) {
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

  };


  /**
   * Bezier curve prototype. API:
   *
   * 1.  getLUT(steps) yields array/steps of {x:..., y:..., z:...} coordinates.
   * 2.  get(t) alias for compute(t).
   * 3.  compute(t) yields the curve coordinate at 't'.
   * 4.  derivative(t) yields the curve derivative at 't' as vector.
   * 5.  normal(t) yields the normal vector for the curve at 't'.
   * 6a. split(t) split the curve at 't' and return both segments as new curves.
   * 6b. split(t1,t2) split the curve between 't1' and 't2' and return the segment as new curve.
   * 7.  inflections() yields all known inflection points on this curve.
   * 8.  offset(t, d) yields a coordinate that is a point on the curve at 't',
   *                 offset by distance 'd' along its normal.
   * 9.  reduce() yields an array of 'simple' curve segments that model the curve as poly-simple-beziers.
   * 10. scale(d) yields the curve scaled approximately along its normals by distance 'd'.
   *
   */
  Bezier.prototype = {
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
        result[dim] = this.computeDim(dim,t);
      }
      if(!result.z) result.z=0;
      return result;
    },
    computeDim: function(v,t) {
      var p = this.points;
      p = [p[0][v], p[1][v], p[2][v], p[3][v]];
      var mt = 1-t,
          t2 = t*t,
          mt2 = mt*mt,
          a = mt2*mt,
          b = mt2*t*3,
          c = mt*t2*3,
          d = t*t2;
      return a*p[0] + b*p[1] + c*p[2] + d*p[3];
    },
    derivative: function(t) {
      var dims=this.dims,len=this.dimlen,i,dim,result={};
      for(i=len-1; i>-1;i--) {
        dim = dims[i];
        result[dim] = this.derivativeDim(dim,t);
      }
      return result;
    },
    derivativeDim: function(v,t) {
      var p = this.points;
      p = [3*(p[1][v] - p[0][v]), 3*(p[2][v] - p[1][v]), 3*(p[3][v] - p[2][v])];
      var mt = 1-t,
          a = mt*mt,
          b = mt*t*2,
          c = t*t;
      return a*p[0] + b*p[1] + c*p[2];
    },
    normal: function(t) {
      return this._3d ? this.normal3(t) : this.normal2(t);
    },
    normal2: function(t) {
      var d = this.derivative(t);
      var q = Math.sqrt(d.x*d.x + d.y*d.y)
      return { x: -d.y/q, y: d.x/q, z: 0 };
    },
    normal3: function() {
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
        result[dim] = this.splitDim(dim,t1);
      }
      var args, j, idx, curves = [];
      for(i=0; i<2; i++) {
        args = [];
        for(idx=0; idx<4;idx++) {
          for(j=0; j<len; j++) {
            dim = dims[j]
            args.push(result[dim][i][idx])
          }
        }
        curves.push(new Bezier(args));
      }
      // if we have a t2, split again:
      if(t2) {
        t2 = map(t2,t1,1,0,1);
        curves = curves[1].split(t2);
        return curves[0];
      }
      return curves;
    },
    splitDim: function(v,z) {
      // see http://pomax.github.io/bezierinfo/#matrixsplit
      var p = this.points;
      p = [p[0][v], p[1][v], p[2][v], p[3][v]];
      var zm = z-1,
          z2 = z*z,
          zm2 = zm*zm,
          z3 = z2*z,
          zm3 = zm2*zm;
      var p1 = p[0],
          p2 = z*p[1] - zm*p[0],
          p3 = z2*p[2] - 2*z*zm*p[1] + zm2*p[0],
          p4 = z3*p[3] - 3*z2*zm*p[2] + 3*z*zm2*p[1]-zm3*p[0],
          p5 = p4,
          p6 = z2*p[3] - 2*z*zm*p[2] + zm2*p[1],
          p7 = z*p[3] - zm*p[2],
          p8 = p[3];
      return [[p1,p2,p3,p4],[p5,p6,p7,p8]];
    },
    rootsd1: function(p) {
      var a = 3*(p[1]-p[0]),
          b = 3*(p[2]-p[1]),
          c = 3*(p[3]-p[2]),
          d = a - 2*b + c;
      if(d!==0) {
        var m1 = -Math.sqrt(b*b-a*c),
            m2 = -a+b,
            v1 = -( m1+m2)/d,
            v2 = -(-m1+m2)/d;
        return [v1, v2];
      }
      else if(b!==c && d===0) {
        return [ (2*b-c)/2*(b-c) ];
      }
      return [];
    },
    rootsd2: function(p) {
      var a = 3*(p[1]-p[0]),
          b = 3*(p[2]-p[1]),
          c = 3*(p[3]-p[2]);
      a = 2*(b-a);
      b = 2*(c-b);
      if(a!==b) { return [a/(a-b)] }
      return [];
    },
    inflections: function() {
      var dims=this.dims,len=this.dimlen,i,dim,p,result={},roots=[];
      for(i=len-1; i>-1;i--) {
        dim = dims[i];
        p = this.points.map(function(v) { return v[dim]; });
        // get all iflection points along the curvature
        result[dim] = this.rootsd1(p).concat(this.rootsd2(p));
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
        result[d] = this.getminmax(d, inflections[d]);
      }.bind(this));
      return result;
    },
    getminmax: function(d, list) {
      if(!list) return { min:0, max:0 };
      var min=0xFFFFFFFFFFFFFFFF, max=-min,t,c;
      if(list.indexOf(0)===-1) { list = [0].concat(list); }
      if(list.indexOf(1)===-1) { list.push(1); }
      for(var i=0,len=list.length; i<len; i++) {
        t = list[i];
        c = this.get(t);
        if(c[d] < min) { min = c[d]; }
        if(c[d] > max) { max = c[d]; }
      }
      return { min:min, max:max };
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
        pass1.push(this.split(t1,t2));
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
              pass2.push(p1.split(t1,t2));
              t1 = t2;
              break;
            }
          }
        }
        if(t1<1) { pass2.push(p1.split(t1,1)); }
      });
      return pass2;
    },
    scale: function(d) {
      var v = [ this.offset(0,10), this.offset(1,10) ];
      var o = lli(v[0],v[1]);
      if(!o) { throw "cannot scale this curve. Try reducing it first."; }
      // move all points by distance 'd' wrt the origin 'o'
      var points=this.points,np=[],p;
      // move end points by fixed distance along normal.
      [0,1].forEach(function(t) {
        var p = np[t*3] = copy(points[t*3]);
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
        var o2 = lli(ls, o);
        np[t+1] = o2;
      }.bind(this));
      return new Bezier(np);
    }
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = Bezier;
  }

  else if (typeof window !== "undefined") {
    window.Bezier = Bezier;
  }

}());
