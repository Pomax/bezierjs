module.exports = (function() {
  "use strict";

  // Math functions. I hate the Math namespace with a passion.
  var abs = Math.abs,
      min = Math.min,
      max = Math.max,
      cos = Math.cos,
      sin = Math.sin,
      acos = Math.acos,
      asin = Math.asin,
      atan2 = Math.atan2,
      sqrt = Math.sqrt,
      pow = Math.pow,
      crt = function(v) { if(v<0) return -pow(-v,1/3); return pow(v,1/3); },
      pi = Math.PI,
      tau = 2*pi;

  var utils = require("./utils");
  var PolyBezier = require("./polybezier");

  var Bezier = function(args, _3d) {
    this.points = [];
    if(!args) return;
    if(args[0].x) { this.points = args; }
    else {
      for (var p, i=0, last=args.length; i<last; i+=_3d ? 3 : 2) {
        p = {};
        p.x = args[i];
        p.y = args[i+1];
        if(_3d) p.z = args[i+2];
        this.points.push(p);
      }
    }
    this._3d = _3d;
    this.order = this.points.length-1;
    this.recache();
  };

  Bezier.prototype = {
    recache: function() {
      this.cache = {};
      // cache derivative coordinates
      var cached = this.cache.d = [];
      var p = this.points,
          d, l, a, i, n={};
      for(d=this.order; d>1; d--) {
        l = cached.length;
        a = cached[l] = [];
        for(i=0; i<d; i++) {
          n = {};
          n.x = d * (p[i+1].x - p[i].x);
          n.y = d * (p[i+1].y - p[i].y);
          if(this._3d) {
          n.z = d * (p[i+1].z - p[i].z);
          }
          a.push(n);
        }
        p = a;
      }
      // cache normals at the end points
      cached = this.cache.n = [];
      cached[0] = this.offset(0,1);
      cached[this.order] = this.offset(1,1);
      this.cache.LUT = [];
    },

    length: function() {
      return utils.length(this.points, this.derivative.bind(this));
    },

    point: function(idx) {
      return this.points[idx];
    },

    get: function(t) {
      return this.compute(t);
    },

    compute: function(t) {
      var p = this.points,
          v = {x:0, y:0};
      if(this._3d) { v.z = 0; }
      for(var n=this.order, k=0; k<=n; k++) {
        v.x += utils.binomial(n,k) * pow((1-t),n-k) * pow(t,k) * p[k].x;
        v.y += utils.binomial(n,k) * pow((1-t),n-k) * pow(t,k) * p[k].y;
        if(this._3d) {
        v.z += utils.binomial(n,k) * pow((1-t),n-k) * pow(t,k) * p[k].z;
        }
      }
      return v;
    },

    derivative: function(t) {
      var p = this.cache.d[0],
          v = {x:0, y:0};
      if(this._3d) { v.z = 0; }
      for(var n=this.order-1, k=0; k<=n; k++) {
        v.x += utils.binomial(n,k) * pow((1-t),n-k) * pow(t,k) * p[k].x;
        v.y += utils.binomial(n,k) * pow((1-t),n-k) * pow(t,k) * p[k].y;
        if(this._3d) {
        v.z += utils.binomial(n,k) * pow((1-t),n-k) * pow(t,k) * p[k].z;
        }
      }
      return v;
    },

    getLUT: function(size) {
      size = size || 100;
      if(this.cache.LUT.length === size) return this.cache.LUT;
      var LUT = this.cache.LUT = [];
      for(var t=0, d=size-1; t<size; t++) {
        LUT[t] = this.compute(t/d);
      }
      return LUT;
    },

    bbox: function() {
      var inflections = this.inflections(), result = {};
      result.x = utils.getminmax(this, 'x', inflections.x);
      result.y = utils.getminmax(this, 'y', inflections.y);
      if(this._3d) {
      result.z = utils.getminmax(this, 'z', inflections.z);
      }
      return result;
    },

    raise: function() {
      var p = this.points, np = [p[0]], i, k=p.length, pi, pim, r, R;
      for (var i=1; i<k; i++) {
        pim = p[i-1];
        r = i/k;
        pi = p[i];
        R = (k-i)/k;
        np[i] = {};
        np[i].x = r*pim.x + R*pi.x;
        np[i].y = r*pim.y + R*pi.y;
        if(this._3d) { np[i].z = r*pim.z + R*pi.z; }
      }
      np[k] = p[k-1];
      return new Bezier(np);
    },

    split: function(t,t2) {
      var split = this._split(t);
      if(typeof t2 === "undefined") return split;
      t = utils.map(t2,t,1,0,1);
      return split.right.split(t).left;
    },

    section: function(t1, t2) {
      if(t1===1) return false;
      if(t1===0 && !t2) return this;
      if(t1===0 &&  t2) return this._split(t2).left;
      if(t2===1) return this._split(t1).right;
      return this._section(t1,t2);
    },

    normal: function(t) {
      return this._3d ? this.__normal3(t) : this.__normal2(t);
    },

    __normal2: function(t) {
      var d = this.derivative(t);
      var q = sqrt(d.x*d.x + d.y*d.y)
      return { x: -d.y/q, y: d.x/q };
    },

    __normal3: function(t) {
      // see http://stackoverflow.com/questions/25453159
      var r1 = this.derivative(t),
          r2 = this.derivative(t+0.01),
          q1 = sqrt(r1.x*r1.x + r1.y*r1.y + r1.z*r1.z),
          q2 = sqrt(r2.x*r2.x + r2.y*r2.y + r2.z*r2.z);
      r1.x /= q1; r1.y /= q1; r1.z /= q1;
      r2.x /= q2; r2.y /= q2; r2.z /= q2;
      // cross product
      var c = {
        x: r2.y*r1.z - r2.z*r1.y,
        y: r2.z*r1.x - r2.x*r1.z,
        z: r2.x*r1.y - r2.y*r1.x
      };
      var m = sqrt(c.x*c.x + c.y*c.y + c.z*c.z);
      c.x /= m; c.y /= m; c.z /= m;
      // rotation matrix
      var R = [   c.x*c.x,   c.x*c.y-c.z, c.x*c.z+c.y,
                c.x*c.y+c.z,   c.y*c.y,   c.y*c.z-c.x,
                c.x*c.z-c.y, c.y*c.z+c.x,   c.z*c.z    ];
      // normal vector:
      return {
        x: R[0] * r1.x + R[1] * r1.y + R[2] * r1.z,
        y: R[3] * r1.x + R[4] * r1.y + R[5] * r1.z,
        z: R[6] * r1.x + R[7] * r1.y + R[8] * r1.z
      };
    },

    offset: function(t, d) {
      if(d) {
        var c = this.get(t);
        var n = this.normal(t);
        var ret = {
          v: n,
          p1: c,
          p2: { x: c.x + n.x * d, y: c.y + n.y * d }
        };
        if(this._3d) { ret.p2.z = c.z + n.z * d; };
        return ret;
      }
      // linear offset
      if(this._linear) {
        var nv = this.normal(0);
        var coords = this.points.map(function(p) {
          var ret = {}
          ret.x = p.x + t * nv.x;
          ret.y = p.y + t * nv.y;
          if(p.z && n.z) {
          ret.z = p.z + t * nv.z;
          }
          return ret;
        });
        if(this.order === 2) return [new Bezier2(coords)];
        if(this.order === 3) return [new Bezier3(coords)];
        return [new Bezier(coords)];
      }
      // true offset
      return this.reduce().map(function(s) { return s.scale(t); });
    },

    simple: function() {
      if(this._3d) { return this._simple3d(); }
      if(this.order===3) {
        var a1 = utils.angle(this.points[0], this.points[3], this.points[1]);
        var a2 = utils.angle(this.points[0], this.points[3], this.points[2]);
        if(a1>0 && a2<0 || a1<0 && a2>0) return false;
      }
      var n1 = this.normal(0);
      var n2 = this.normal(1);
      var s = n1.x*n2.x + n1.y*n2.y;
      if(this._3d) { s += n1.z*n2.z; }
      var angle = abs(acos(s));
      return angle < pi/3;
    },

    _simple3d: function() {
      // FIXME: TODO: actually implement this.
      this._3d = false;
      var s = this.simple();
      this._3d = true;
    },

    reduce: function() {
      if(this._linear) { return [this]; }

      var i, t1=0, t2=0, step=0.01, segment, pass1=[];

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

      var pass2 = new PolyBezier();

      // second pass: further reduce these segments to simple segments
      pass1.forEach(function(p1) {
        t1=0;
        t2=0;
        while(t2 <= 1) {
          for(t2=t1+step; t2<=1+step; t2+=step) {
            segment = p1.split(t1,t2);
            if(!segment.simple()) {
              t2 -= step;
              if(abs(t1-t2)<step) {
                // we can never form a reduction
                return [];
              }
              segment = p1.split(t1,t2);
              segment._t1 = utils.map(t1,0,1,p1._t1,p1._t2);
              segment._t2 = utils.map(t2,0,1,p1._t1,p1._t2);
              pass2.add(segment);
              t1 = t2;
              break;
            }
          }
        }
        if(t1<1) {
          segment = p1.split(t1,1);
          segment._t1 = utils.map(t1,0,1,p1._t1,p1._t2);
          segment._t2 = p1._t2;
          pass2.add(segment);
        }
      });
      return pass2;
    },

    outline: function(d1, d2, d3, d4) {
      d2 = (typeof d2 === "undefined") ? d1 : d2;
      var reduced = this.reduce(),
          len = reduced.length,
          order = this.order,
          fcurves = [],
          bcurves = [],
          i, p, last,
          alen = 0,
          tlen = this.length();

      var graduated = (typeof d3 !== "undefined" && typeof d4 !== "undefined");

      function linearDistanceFunction(s,e, tlen,alen,slen) {
        return function (v) {
          var f1 = alen/tlen, f2 = (alen+slen)/tlen, d = e-s;
          return utils.map(v, 0,1, s+f1*d, s+f2*d);
        };
      };

      // form curve oulines
      reduced.forEach(function(segment) {
        slen = segment.length();
        if (graduated) {
          fcurves.push(segment.scale(  linearDistanceFunction( d1, d3, tlen,alen,slen)  ));
          bcurves.push(segment.scale(  linearDistanceFunction(-d2,-d4, tlen,alen,slen)  ));
        } else {
          fcurves.push(segment.scale( d1));
          bcurves.push(segment.scale(-d2));
        }
        alen += slen;
      });

      // reverse the "return" outline
      bcurves = bcurves.map(function(s) {
        p = s.points;
        if(p[3]) { s.points = [p[3],p[2],p[1],p[0]]; }
        else { s.points = [p[2],p[1],p[0]]; }
        return s;
      }).reverse();

      // form the endcaps as lines
      var fs = fcurves[0].points[0],
          fe = fcurves[len-1].points[fcurves[len-1].points.length-1],
          bs = bcurves[len-1].points[bcurves[len-1].points.length-1],
          be = bcurves[0].points[0],
          ls = utils.makeline(bs,fs),
          le = utils.makeline(fe,be),
          segments = [ls].concat(fcurves).concat([le]).concat(bcurves),
          slen = segments.length;

      return new PolyBezier(segments);
    },

    outlineshapes: function(d1,d2) {
      d2 = d2 || d1;
      var outline = this.outline(d1,d2).curves;
      var shapes = [];
      for(var i=1, len=outline.length; i < len/2; i++) {
        var shape = utils.makeshape(outline[i], outline[len-i]);
        shape.startcap.virtual = (i > 1);
        shape.endcap.virtual = (i < len/2-1);
        shapes.push(shape);
      }
      return shapes;
    },

    _toSVG: function(op, origin) {
      if(this._3d) return false;
      if(origin) return this._toRelativeSVG(op.toLowerCase(), origin);
      if(this._linear) return ["M",this.p1.x,this.p1.y,"L",this.p2.x,this.p2.y].join(" ");
      var p = this.points,
          x = p[0].x,
          y = p[0].y,
          s = ["M",x,y];
      s.push(op);
      for(var i=1, last=p.length; i<last; i++) { s.push(p[i].x); s.push(p[i].y); }
      return s.join(" ");
    },

    _toRelativeSVG: function(op, origin) {
      var x = origin.x,
          y = origin.y;
      if(this._linear) {
        var s = ["m",this.p1.x-x,this.p1.y-x]
        x = this.p1.x;
        y = this.p1.y;
        return s.concat(["l",this.p2.x-x,this.p2.y-x]).join(" ");
      }
      var p = this.points;
      x = p[0].x - x;
      y = p[0].y - y;
      var s = ["m",x,y,op];
      for(var i=1, last=p.length; i<last; i++) {
        s.push(p[i].x - x); s.push(p[i].y - y);
        x=p[i].x; y=p[i].y;
      }
      return s.join(" ");
    }
  };

  return Bezier;
}());
