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

  Bezier.isLinear = function(curve) {
    var order = Bezier.order(curve);
    var a = utils.align(curve, {p1:curve[0], p2:curve[order]});
    for(var i=0; i<a.length; i++) {
      if(abs(a[i].y) > 0.0001) {
        return false;
      }
    }
    return true;
  };

  Bezier.isSimple = function(curve) {
    if(Bezier.order(curve)===3) {
      var a1 = utils.angle(curve[0], curve[3], curve[1]);
      var a2 = utils.angle(curve[0], curve[3], curve[2]);
      if(a1>0 && a2<0 || a1<0 && a2>0) return false;
    }
    var n1 = Bezier.normal(curve, 0);
    var n2 = Bezier.normal(curve, 1);
    var s = n1.x*n2.x + n1.y*n2.y;
    if(Bezier.is3d(curve)) { s += n1.z*n2.z; }
    var angle = abs(acos(s));
    return angle < pi/3;
  };

  Bezier.reverse = function(curve) {
    var invertedCurve = curve.concat().reverse();

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
        Array.prototype.push.apply(result[dim], utils.droots(p));
      }
      result[dim] = result[dim].filter(function(t) { return (t>=0 && t<=1); });
      Array.prototype.push.apply(roots, result[dim].sort());
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

  Bezier.overlaps = function(curve, candidate) {
    var lbbox = Bezier.bbox(curve),
        tbbox = Bezier.bbox(candidate);
    return utils.bboxoverlap(lbbox,tbbox);
  };

  Bezier.offset = function(curve, t, d) {
    if(typeof d !== "undefined") {
      var c = Bezier.compute(curve, t);
      var n = Bezier.normal(curve, t);
      var ret = {
        c: c,
        n: n,
        x: c.x + n.x * d,
        y: c.y + n.y * d
      };
      if(Bezier.is3d(curve)) {
        ret.z = c.z + n.z * d;
      };
      return ret;
    }
    if(Bezier.isLinear(curve)) {
      var nv = Bezier.normal(curve, 0);
      return curve.map(function(p) {
        var ret = {
          x: p.x + t * nv.x,
          y: p.y + t * nv.y
        };
        if(p.z && n.z) { ret.z = p.z + t * nv.z; }
        return ret;
      });
    }
    var reduced = Bezier.reduce(curve);
    return reduced.map(function(s) {
      return Bezier.scale(s,t);
    });
  };

  Bezier.reduce = function(curve) {
    var i, t1=0, t2=0, step=0.01, segment, pass1=[], pass2=[];
    // first pass: split on extrema
    var extrema = Bezier.extrema(curve).values;
    if(extrema.indexOf(0)===-1) { extrema.unshift(0); }
    if(extrema.indexOf(1)===-1) { extrema.push(1); }

    for(t1=extrema[0], i=1; i<extrema.length; i++) {
      t2 = extrema[i];
      segment = Bezier.split(curve,t1,t2);
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
          segment = Bezier.split(p1,t1,t2);
          if(!Bezier.isSimple(segment)) {
            t2 -= step;
            if(abs(t1-t2)<step) {
              // we can never form a reduction
              return [];
            }
            segment = Bezier.split(p1,t1,t2);
            segment._t1 = utils.map(t1,0,1,p1._t1,p1._t2);
            segment._t2 = utils.map(t2,0,1,p1._t1,p1._t2);
            pass2.push(segment);
            t1 = t2;
            break;
          }
        }
      }
      if(t1<1) {
        segment = Bezier.split(p1,t1,1);
        segment._t1 = utils.map(t1,0,1,p1._t1,p1._t2);
        segment._t2 = p1._t2;
        pass2.push(segment);
      }
    });
    return pass2;
  };

  Bezier.scale = function(curve, d) {
    var order = Bezier.order(curve);
    var distanceFn = false
    if(typeof d === "function") { distanceFn = d; }
    if(distanceFn && order === 2) { return Bezier.scale(Bezier.raise(curve), distanceFn); }

    // TODO: add special handling for degenerate (=linear) curves.
    var clockwise = Bezier.isClockwise(curve);
    var r1 = distanceFn ? distanceFn(0) : d;
    var r2 = distanceFn ? distanceFn(1) : d;
    var v = [ Bezier.offset(curve,0,10), Bezier.offset(curve,1,10) ];
    var o = utils.lli4(v[0], v[0].c, v[1], v[1].c);
    if(!o) { throw new Error("cannot scale this curve. Try reducing it first."); }
    // move all points by distance 'd' wrt the origin 'o'
    var np=[];

    // move end points by fixed distance along normal.
    [0,1].forEach(function(t) {
      var p = np[t*order] = Object.assign({}, curve[t*order]);
      p.x += (t?r2:r1) * v[t].n.x;
      p.y += (t?r2:r1) * v[t].n.y;
    });

    if (!distanceFn) {
      // move control points to lie on the intersection of the offset
      // derivative vector, and the origin-through-control vector
      [0,1].forEach(function(t) {
        if(order===2 && !!t) return;
        var p = np[t*order];
        var d = Bezier.derivative(curve, t);
        var p2 = { x: p.x + d.x, y: p.y + d.y };
        np[t+1] = utils.lli4(p, p2, o, curve[t+1]);
      });
      return np;
    }

    // move control points by "however much necessary to
    // ensure the correct tangent to endpoint".
    [0,1].forEach(function(t) {
      if(order===2 && !!t) return;
      var p = curve[t+1];
      var ov = {
        x: p.x - o.x,
        y: p.y - o.y
      };
      var rc = distanceFn ? distanceFn((t+1)/order) : d;
      if(distanceFn && !clockwise) rc = -rc;
      var m = sqrt(ov.x*ov.x + ov.y*ov.y);
      ov.x /= m;
      ov.y /= m;
      np[t+1] = {
        x: p.x + rc*ov.x,
        y: p.y + rc*ov.y
      }
    });
    return np;
  };

  Bezier.outline = function(curve, d1, d2, d3, d4) {
    d2 = (typeof d2 === "undefined") ? d1 : d2;
    var reduced = Bezier.reduce(curve),
        len = reduced.length,
        fcurves = [],
        bcurves = [],
        p,
        alen = 0,
        tlen = Bezier.length(curve);

    var graduated = (typeof d3 !== "undefined" && typeof d4 !== "undefined");

    function linearDistanceFunction(s,e, tlen,alen,slen) {
      return function (v) {
        var f1 = alen/tlen, f2 = (alen+slen)/tlen, d = e-s;
        return utils.map(v, 0,1, s+f1*d, s+f2*d);
      };
    };

    // form curve oulines
    reduced.forEach(function(segment) {
      var slen = Bezier.length(segment);
      if (graduated) {
        fcurves.push(Bezier.scale( segment, linearDistanceFunction( d1, d3, tlen,alen,slen) ));
        bcurves.push(Bezier.scale( segment, linearDistanceFunction(-d2,-d4, tlen,alen,slen) ).reverse());
      } else {
        fcurves.push(Bezier.scale(segment, d1));
        bcurves.push(Bezier.scale(segment, -d2).reverse());
      }
      alen += slen;
    });

    // reverse the "return" outline
    bcurves.reverse();

    // form the endcaps as lines
    var fs = fcurves[0][0],
        fe = fcurves[len-1][fcurves[len-1].length-1],
        bs = bcurves[len-1][bcurves[len-1].length-1],
        be = bcurves[0][0],
        ls = utils.makeline(bs,fs),
        le = utils.makeline(fe,be),
        segments = [].concat(ls,fcurves,le,bcurves);

    return segments;
  };

  Bezier.outlineshapes = function(curve, d1, d2, curveIntersectionThreshold) {
    d2 = d2 || d1;
    var outline = Bezier.outline(curve, d1, d2);

    var shapes = [];
    for(var i=1, len=outline.length; i < len/2; i++) {
      var shape = utils.makeshape(outline[i], outline[len-i], curveIntersectionThreshold);
      shape.startcap[0] = Object.assign({}, shape.startcap[0], { virtual: (i > 1) });
      shape.endcap[0] = Object.assign({}, shape.endcap[0], { virtual: (i < len/2-1) });
      shapes.push(shape);
    }
    return shapes;
  };

  Bezier.intersects = function(curve, candidate, curveIntersectionThreshold) {
    if(!candidate) {
      return Bezier.selfintersects(curve, curveIntersectionThreshold);
    }
    if(candidate.p1 && candidate.p2) {
      return Bezier.lineIntersects(curve, candidate);
    }
    // candidate is a Bezier
    return this.curveintersects(Bezier.reduce(curve), Bezier.reduce(candidate), curveIntersectionThreshold);
  };

  Bezier.lineIntersects = function(curve, line) {
    var mx = min(line.p1.x, line.p2.x),
        my = min(line.p1.y, line.p2.y),
        MX = max(line.p1.x, line.p2.x),
        MY = max(line.p1.y, line.p2.y);
    return utils.roots(curve, line).filter(function(t) {
      var p = Bezier.compute(curve, t);
      return utils.between(p.x, mx, MX) && utils.between(p.y, my, MY);
    });
  };

  Bezier.curveintersects = function(curve, c1, c2, curveIntersectionThreshold) {
    var pairs = [];
    // step 1: pair off any overlapping segments
    c1.forEach(function(l) {
      c2.forEach(function(r) {
        if(Bezier.overlaps(l,r)) {
          pairs.push({ left: l, right: r });
        }
      });
    });
    // step 2: for each pairing, run through the convergence algorithm.
    var intersections = [];
    pairs.forEach(function(pair) {
      var result = utils.pairiteration(pair.left, pair.right, curveIntersectionThreshold);
      if(result.length > 0) {
        Array.prototype.push.apply(intersections, result);
      }
    });
    return intersections;
  };

  Bezier.arcs = function(curve, errorThreshold) {
    errorThreshold = errorThreshold || 0.5;
    var circles = [];
    return Bezier._iterate(curve, errorThreshold, circles);
  };

  Bezier._error = function(curve, pc, np1, s, e) {
    var q = (e - s) / 4,
        c1 = Bezier.compute(curve, s + q),
        c2 = Bezier.compute(curve, e - q),
        ref = utils.dist(pc, np1),
        d1  = utils.dist(pc, c1),
        d2  = utils.dist(pc, c2);
    return abs(d1-ref) + abs(d2-ref);
  };

  Bezier._iterate = function(curve, errorThreshold, circles) {
    var s = 0, e = 1, safety;
    // we do a binary search to find the "good `t` closest to no-longer-good"
    do {
      safety=0;

      // step 1: start with the maximum possible arc
      e = 1;

      // points:
      var np1 = Bezier.compute(curve, s), np2, np3, arc, prev_arc;

      // booleans:
      var curr_good = false, prev_good = false, done;

      // numbers:
      var m = e, prev_e = 1, step = 0;

      // step 2: find the best possible arc
      do {
        prev_good = curr_good;
        prev_arc = arc;
        m = (s + e)/2;
        step++;

        np2 = Bezier.compute(m);
        np3 = Bezier.compute(e);

        arc = utils.getccenter(np1, np2, np3);

        //also save the t values
        arc.interval = {
          start: s,
          end: e
        };

        var error = Bezier._error(curve, arc, np1, s, e);
        curr_good = (error <= errorThreshold);

        done = prev_good && !curr_good;
        if(!done) prev_e = e;

        // this arc is fine: we can move 'e' up to see if we can find a wider arc
        if(curr_good) {
          // if e is already at max, then we're done for this arc.
          if (e >= 1) {
            prev_e = 1;
            prev_arc = arc;
            break;
          }
          // if not, move it up by half the iteration distance
          e = e + (e-s)/2;
        }

        // this is a bad arc: we need to move 'e' down to find a good arc
        else {
          e = m;
        }
      }
      while(!done && safety++<100);

      if(safety>=100) {
        console.error("arc abstraction somehow failed...");
        break;
      }

      prev_arc = (prev_arc ? prev_arc : arc);
      circles.push(prev_arc);
      s = prev_e;
    }
    while(e < 1);
    return circles;
  };

  return Bezier;
};
