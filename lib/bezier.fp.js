/**
  A javascript Bezier curve library by Pomax.

  Based on http://pomax.github.io/bezierinfo

  This code is MIT licensed.
**/
module.exports = function(utils) {
  'use strict';

  // math-inlining.
  var abs = Math.abs,
      min = Math.min,
      max = Math.max,
      acos = Math.acos,
      sqrt = Math.sqrt,
      pi = Math.PI,
      // a zero coordinate, which is surprisingly useful
      ZERO = {x:0,y:0,z:0};

  var Bezier = {};

  Bezier.order = function(curve) {
    return curve.length - 1;
  };

  Bezier.is3d = function(curve) {
    return 'z' in curve[0];
  };

  Bezier.dims = function(curve) {
    return 'z' in curve[0] ? ['x','y','z'] : ['x','y'];
  };

  Bezier.dimlen = function(curve) {
    return 'z' in curve[0] ? 3 : 2;
  };

  Bezier.toSVG = function(curve) {
    if (Bezier.is3d(curve)) return false;
    var p = curve,
        x = p[0].x,
        y = p[0].y,
        s = ["M", x, y, (p.length===3 ? "Q":"C")];
    for(var i=1, last=p.length; i<last; i++) {
      s.push(p[i].x);
      s.push(p[i].y);
    }
    return s.join(" ");
  };

  Bezier.invert = function(curve) {
    var invertedCurve = [];

    for(var p=curve, i=p.length-1; i>=0; i--) {
      invertedCurve.push(curve[i]);
    }

    // the first point of the curve might hold extra info
    var props = Object.keys(curve[0]);
    if(props.length !== Bezier.dimlen(curve)) {
      var order = Bezier.order(curve);
      var first = invertedCurve[0] = Object.assign({}, curve[order]);
      var last = invertedCurve[curve.length-1] = {};
      props.forEach(function(key) {
        var value = curve[0][key];
        if ( key === 'x' || key === 'y' || key === 'z' ) {
          last[key] = value;

        // _t1 _t2 need special treatment when inverted
        } else if ( key === '_t1' || key === '_t2' ) {
          first[key === '_t1' ? '_t2' : '_t1'] = 1 - value;

        } else {
          first[key] = value;
        }
      });
    }

    return invertedCurve;
  };

  Bezier.derivativePoints = function(curve) {
    var dpoints = [];
    var is3d = Bezier.is3d(curve);

    for(var p=curve, d=p.length, c=d-1; d>1; d--, c--) {
      var list = [];
      for(var j=0, dpt; j<c; j++) {
        dpt = {
          x: c * (p[j+1].x - p[j].x),
          y: c * (p[j+1].y - p[j].y)
        };
        if(is3d) {
          dpt.z = c * (p[j+1].z - p[j].z);
        }
        list.push(dpt);
      }
      dpoints.push(list);
      p = list;
    }

    return dpoints;
  };

  Bezier.computedirection = Bezier.isClockwise = function(curve) {
    return utils.angle(curve[0], curve[curve.length - 1], curve[1]) > 0;
  };

  Bezier.derivative = function(curve, t) {
    var mt = 1-t,
        a,b,c=0,
        dpoints = Bezier.derivativePoints(curve),
        order = Bezier.order(curve),
        p = dpoints[0];

    if(order===2) { p = [p[0], p[1], ZERO]; a = mt; b = t; }
    if(order===3) { a = mt*mt; b = mt*t*2; c = t*t; }
    var ret = {
      x: a*p[0].x + b*p[1].x + c*p[2].x,
      y: a*p[0].y + b*p[1].y + c*p[2].y
    };
    if(Bezier.is3d(curve)) {
      ret.z = a*p[0].z + b*p[1].z + c*p[2].z;
    }
    return ret;
  };

  Bezier.length = function(curve) {
    return utils.length(function(t) {
      return Bezier.derivative(curve, t);
    });
  };

  Bezier.get = Bezier.compute = function(curve, t) {
    // shortcuts
    if(t===0) { return curve[0]; }
    if(t===1) { return curve[curve.length - 1]; }

    var p = curve;
    var mt = 1-t;
    var order = Bezier.order(curve);
    var is3d = Bezier.is3d(curve);

    // linear?
    if(order===1) {
      ret = {
        x: mt*p[0].x + t*p[1].x,
        y: mt*p[0].y + t*p[1].y
      };
      if (is3d) { ret.z = mt*p[0].z + t*p[1].z; }
      return ret;
    }

    // quadratic/cubic curve?
    if(order<4) {
      var mt2 = mt*mt,
          t2 = t*t,
          a,b,c,d = 0;
      if(order===2) {
        p = [p[0], p[1], p[2], ZERO];
        a = mt2;
        b = mt*t*2;
        c = t2;
      }
      else if(order===3) {
        a = mt2*mt;
        b = mt2*t*3;
        c = mt*t2*3;
        d = t*t2;
      }
      var ret = {
        x: a*p[0].x + b*p[1].x + c*p[2].x + d*p[3].x,
        y: a*p[0].y + b*p[1].y + c*p[2].y + d*p[3].y
      };
      if(is3d) {
        ret.z = a*p[0].z + b*p[1].z + c*p[2].z + d*p[3].z;
      }
      return ret;
    }

    // higher order curves: use de Casteljau's computation
    var dCpts = JSON.parse(JSON.stringify(curve));
    while(dCpts.length > 1) {
      for (var i=0; i<dCpts.length-1; i++) {
        dCpts[i] = {
          x: dCpts[i].x + (dCpts[i+1].x - dCpts[i].x) * t,
          y: dCpts[i].y + (dCpts[i+1].y - dCpts[i].y) * t
        };
        if (typeof dCpts[i].z !== 'undefined') {
          dCpts[i] = dCpts[i].z + (dCpts[i+1].z - dCpts[i].z) * t;
        }
      }
      dCpts.splice(dCpts.length-1, 1);
    }
    return dCpts[0];
  }

  Bezier.getLUT = Bezier.LUT = function(curve, steps) {
    steps = steps || 100;
    var lut = [];
    for(var t=0; t<=steps; t++) {
      lut.push(Bezier.compute(curve, t/steps));
    }
    return lut;
  };

  Bezier.on = Bezier.crosses = function(curve, point, error) {
    error = error || 5;
    var lut = Bezier.getLUT(curve), hits = [], c, t=0;
    for(var i=0; i<lut.length; i++) {
      c = lut[i];
      if (utils.dist(c,point) < error) {
        hits.push(c)
        t += i / lut.length;
      }
    }
    if(!hits.length) return false;
    return t /= hits.length;
  };

  Bezier.project = function(curve, point) {
    // step 1: coarse check
    var lut = Bezier.getLUT(curve), l = lut.length-1,
        closest = utils.closest(lut, point),
        mdist = closest.mdist,
        mpos = closest.mpos;
    if (mpos===0 || mpos===l) {
      var t = mpos/l, pt = Bezier.compute(curve, t);
      pt.t = t;
      pt.d = mdist;
      return pt;
    }

    // step 2: fine check
    var ft, t, p, d,
        t1 = (mpos-1)/l,
        t2 = (mpos+1)/l,
        step = 0.1/l;
    mdist += 1;
    for(t=t1,ft=t; t<t2+step; t+=step) {
      p = Bezier.compute(curve, t);
      d = utils.dist(point, p);
      if (d<mdist) {
        mdist = d;
        ft = t;
      }
    }
    p = Bezier.compute(curve, ft);
    p.t = ft;
    p.d = mdist;
    return p;
  };

  Bezier.raise = function(curve) {
    var p = curve, np = [p[0]], i, k=p.length, pi, pim;
    for (var i=1; i<k; i++) {
      pi = p[i];
      pim = p[i-1];
      np[i] = {
        x: (k-i)/k * pi.x + i/k * pim.x,
        y: (k-i)/k * pi.y + i/k * pim.y
      };
    }
    np[k] = p[k-1];
    return np;
  };

  Bezier.inflections = function(curve) {
    return utils.inflections(curve);
  };

  Bezier.normal = function(curve, t) {
    return Bezier.is3d(curve) ? Bezier.__normal3(curve, t) : Bezier.__normal2(curve, t);
  };

  Bezier.__normal2 = function(curve, t) {
    var d = Bezier.derivative(curve, t);
    var q = sqrt(d.x*d.x + d.y*d.y);
    return { x: -d.y/q, y: d.x/q };
  };

  Bezier.__normal3 = function(curve, t) {
    // see http://stackoverflow.com/questions/25453159
    var r1 = Bezier.derivative(curve, t),
        r2 = Bezier.derivative(curve, t+0.01),
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
    var n = {
      x: R[0] * r1.x + R[1] * r1.y + R[2] * r1.z,
      y: R[3] * r1.x + R[4] * r1.y + R[5] * r1.z,
      z: R[6] * r1.x + R[7] * r1.y + R[8] * r1.z
    };
    return n;
  };

  Bezier.hull = function(curve, t) {
    var p = curve,
        _p = [],
        pt,
        q = [],
        idx = 0,
        i=0,
        l=0;
    q[idx++] = p[0];
    q[idx++] = p[1];
    q[idx++] = p[2];
    if(Bezier.order(curve) === 3) { q[idx++] = p[3]; }
    // we lerp between all points at each iteration, until we have 1 point left.
    while(p.length>1) {
      _p = [];
      for(i=0, l=p.length-1; i<l; i++) {
        pt = utils.lerp(t,p[i],p[i+1]);
        q[idx++] = pt;
        _p.push(pt);
      }
      p = _p;
    }
    return q;
  };

  Bezier.split = function(curve, t1, t2) {
    // shortcuts
    if(t1===0 && !!t2) { return Bezier.split(curve, t2).left; }
    if(t2===1) { return Bezier.split(curve, t1).right; }

    // no shortcut: use "de Casteljau" iteration.
    var order = Bezier.order(curve);
    var q = Bezier.hull(curve, t1);
    var result = {
      left: order === 2 ? [q[0],q[3],q[5]] : [q[0],q[4],q[7],q[9]],
      right: order === 2 ? [q[5],q[4],q[2]] : [q[9],q[8],q[6],q[3]],
      span: q
    };

    // make sure we bind _t1/_t2 information!
    // in bezier.fp _t1/_t2 are stored as props of the first point of the curve
    result.left[0] = Object.assign({}, result.left[0], {
      _t1: utils.map(0,  0,1, curve[0]._t1 || 0, curve[0]._t2 || 1 ),
      _t2: utils.map(t1, 0,1, curve[0]._t1 || 0, curve[0]._t2 || 1 ),
    });
    result.right[0] = Object.assign({}, result.right[0], {
      _t1: utils.map(t1, 0,1, curve[0]._t1 || 0, curve[0]._t2 || 1 ),
      _t2: utils.map(1,  0,1, curve[0]._t1 || 0, curve[0]._t2 || 1 ),
    });

    // if we have no t2, we're done
    if(!t2) { return result; }

    // if we have a t2, split again:
    t2 = utils.map(t2,t1,1,0,1);
    var subsplit = Bezier.split(result.right, t2);
    return subsplit.left;
  };

  Bezier.extrema = function(curve) {
    var dims = Bezier.dims(curve),
        order = Bezier.order(curve),
        dpoints = Bezier.derivativePoints(curve),
        result={},
        roots=[],
        p, mfn;
    dims.forEach(function(dim) {
      mfn = function(v) { return v[dim]; };
      p = dpoints[0].map(mfn);
      result[dim] = utils.droots(p);
      if(order === 3) {
        p = dpoints[1].map(mfn);
        result[dim] = result[dim].concat(utils.droots(p));
      }
      result[dim] = result[dim].filter(function(t) { return (t>=0 && t<=1); });
      roots = roots.concat(result[dim].sort());
    });
    roots = roots.sort().filter(function(v,idx) { return (roots.indexOf(v) === idx); });
    result.values = roots;
    return result;
  };

  Bezier.bbox = function(curve) {
    var extrema = Bezier.extrema(curve), result = {},
        dims = Bezier.dims(curve);

    dims.forEach(function(d) {
      result[d] = utils.getminmax(curve, d, extrema[d]);
    });
    return result;
  };

  Bezier.outlineshapes = function(curve, d1, d2, curveIntersectionThreshold) {
    d2 = d2 || d1;
    var outline = Bezier.outline(curve, d1, d2).curves;
    var shapes = [];
    for(var i=1, len=outline.length; i < len/2; i++) {
      var shape = utils.makeshape(outline[i], outline[len-i], curveIntersectionThreshold);
      shape.startcap[0].virtual = (i > 1);
      shape.endcap[0].virtual = (i < len/2-1);
      shapes.push(shape);
    }
    return shapes;
  };

  return Bezier;
};
