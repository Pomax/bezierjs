/*!
 * bezier-js - v2.6.1
 * Compiled Sun, 02 Aug 2020 15:08:25 UTC
 *
 * bezier-js is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */
function _typeof(obj) {
  "@babel/helpers - typeof";

  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function (obj) {
      return typeof obj;
    };
  } else {
    _typeof = function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

var abs = Math.abs;
var cos = Math.cos;
var sin = Math.sin;
var acos = Math.acos;
var atan2 = Math.atan2;
var sqrt = Math.sqrt;
var pow = Math.pow; // cube root function yielding real roots

var crt = function crt(v) {
  return v < 0 ? -pow(-v, 1 / 3) : pow(v, 1 / 3);
}; // trig constants


var pi = Math.PI;
var tau = 2 * pi;
var quart = pi / 2; // float precision significant decimal

var epsilon = 0.000001; // extremas used in bbox calculation and similar algorithms

var nMax = Number.MAX_SAFE_INTEGER || 9007199254740991;
var nMin = Number.MIN_SAFE_INTEGER || -9007199254740991; // a zero coordinate, which is surprisingly useful

var ZERO = {
  x: 0,
  y: 0,
  z: 0
};
/**
 * @ignore
 */
// Bezier utility functions

var utils = {
  // Legendre-Gauss abscissae with n=24 (x_i values, defined at i=n as the roots of the nth order Legendre polynomial Pn(x))
  Tvalues: [-0.0640568928626056260850430826247450385909, 0.0640568928626056260850430826247450385909, -0.1911188674736163091586398207570696318404, 0.1911188674736163091586398207570696318404, -0.3150426796961633743867932913198102407864, 0.3150426796961633743867932913198102407864, -0.4337935076260451384870842319133497124524, 0.4337935076260451384870842319133497124524, -0.5454214713888395356583756172183723700107, 0.5454214713888395356583756172183723700107, -0.6480936519369755692524957869107476266696, 0.6480936519369755692524957869107476266696, -0.7401241915785543642438281030999784255232, 0.7401241915785543642438281030999784255232, -0.8200019859739029219539498726697452080761, 0.8200019859739029219539498726697452080761, -0.8864155270044010342131543419821967550873, 0.8864155270044010342131543419821967550873, -0.9382745520027327585236490017087214496548, 0.9382745520027327585236490017087214496548, -0.9747285559713094981983919930081690617411, 0.9747285559713094981983919930081690617411, -0.9951872199970213601799974097007368118745, 0.9951872199970213601799974097007368118745],
  // Legendre-Gauss weights with n=24 (w_i values, defined by a function linked to in the Bezier primer article)
  Cvalues: [0.1279381953467521569740561652246953718517, 0.1279381953467521569740561652246953718517, 0.1258374563468282961213753825111836887264, 0.1258374563468282961213753825111836887264, 0.121670472927803391204463153476262425607, 0.121670472927803391204463153476262425607, 0.1155056680537256013533444839067835598622, 0.1155056680537256013533444839067835598622, 0.1074442701159656347825773424466062227946, 0.1074442701159656347825773424466062227946, 0.0976186521041138882698806644642471544279, 0.0976186521041138882698806644642471544279, 0.086190161531953275917185202983742667185, 0.086190161531953275917185202983742667185, 0.0733464814110803057340336152531165181193, 0.0733464814110803057340336152531165181193, 0.0592985849154367807463677585001085845412, 0.0592985849154367807463677585001085845412, 0.0442774388174198061686027482113382288593, 0.0442774388174198061686027482113382288593, 0.0285313886289336631813078159518782864491, 0.0285313886289336631813078159518782864491, 0.0123412297999871995468056670700372915759, 0.0123412297999871995468056670700372915759],
  arcfn: function arcfn(t, derivativeFn) {
    var d = derivativeFn(t);
    var l = d.x * d.x + d.y * d.y;

    if (typeof d.z !== 'undefined') {
      l += d.z * d.z;
    }

    return sqrt(l);
  },

  /**
   * Computes the point at {@code t} on the integral bezier curve defined by the control points {@code points}.
   *
   * @param {number} t - parameter to evaluate at
   * @param {Array<{ x: number, y: number, z?: number }>} points - the control points
   * @param {boolean}[_3d] - whether the bezier curve is in 3-space
   */
  compute: function compute(t, points, _3d) {
    // shortcuts
    if (t === 0) {
      return points[0];
    }

    var order = points.length - 1;

    if (t === 1) {
      return points[order];
    }

    var p = points;
    var mt = 1 - t; // constant?

    if (order === 0) {
      return points[0];
    } // linear?


    if (order === 1) {
      var ret = {
        x: mt * p[0].x + t * p[1].x,
        y: mt * p[0].y + t * p[1].y
      };

      if (_3d) {
        ret.z = mt * p[0].z + t * p[1].z;
      }

      return ret;
    } // quadratic/cubic curve?


    if (order < 4) {
      var mt2 = mt * mt;
      var t2 = t * t;
      var a;
      var b;
      var c;
      var d = 0;

      if (order === 2) {
        p = [p[0], p[1], p[2], ZERO];
        a = mt2;
        b = mt * t * 2;
        c = t2;
      } else if (order === 3) {
        a = mt2 * mt;
        b = mt2 * t * 3;
        c = mt * t2 * 3;
        d = t * t2;
      }

      var _ret = {
        x: a * p[0].x + b * p[1].x + c * p[2].x + d * p[3].x,
        y: a * p[0].y + b * p[1].y + c * p[2].y + d * p[3].y
      };

      if (_3d) {
        _ret.z = a * p[0].z + b * p[1].z + c * p[2].z + d * p[3].z;
      }

      return _ret;
    } // higher order curves: use de Casteljau's computation


    var dCpts = JSON.parse(JSON.stringify(points));

    while (dCpts.length > 1) {
      for (var i = 0; i < dCpts.length - 1; i++) {
        dCpts[i] = {
          x: dCpts[i].x + (dCpts[i + 1].x - dCpts[i].x) * t,
          y: dCpts[i].y + (dCpts[i + 1].y - dCpts[i].y) * t
        };

        if (typeof dCpts[i].z !== 'undefined') {
          dCpts[i] = dCpts[i].z + (dCpts[i + 1].z - dCpts[i].z) * t;
        }
      }

      dCpts.splice(dCpts.length - 1, 1);
    }

    return dCpts[0];
  },

  /**
   * Computes the point at {@code t} on the rational bezier curve defined by {@code points} and their
   * {@code ratios}.
   *
   * @param {number} t
   * @param {Array<{ x: number, y: number, z?: number }>} points
   * @param {Array<number>} ratios
   * @param {boolean}[_3d]
   */
  computeWithRatios: function computeWithRatios(t, points, ratios, _3d) {
    var mt = 1 - t;
    var r = ratios;
    var p = points;
    var d;
    var f1 = r[0];
    var f2 = r[1];
    var f3 = r[2];
    var f4 = r[3]; // spec for linear

    f1 *= mt;
    f2 *= t;

    if (p.length === 2) {
      d = f1 + f2;
      return {
        x: (f1 * p[0].x + f2 * p[1].x) / d,
        y: (f1 * p[0].y + f2 * p[1].y) / d,
        z: !_3d ? false : (f1 * p[0].z + f2 * p[1].z) / d
      };
    } // upgrade to quadratic


    f1 *= mt;
    f2 *= 2 * mt;
    f3 *= t * t;

    if (p.length === 3) {
      d = f1 + f2 + f3;
      return {
        x: (f1 * p[0].x + f2 * p[1].x + f3 * p[2].x) / d,
        y: (f1 * p[0].y + f2 * p[1].y + f3 * p[2].y) / d,
        z: !_3d ? false : (f1 * p[0].z + f2 * p[1].z + f3 * p[2].z) / d
      };
    } // upgrade to cubic


    f1 *= mt;
    f2 *= 1.5 * mt;
    f3 *= 3 * mt;
    f4 *= t * t * t;

    if (p.length === 4) {
      d = f1 + f2 + f3 + f4;
      return {
        x: (f1 * p[0].x + f2 * p[1].x + f3 * p[2].x + f4 * p[3].x) / d,
        y: (f1 * p[0].y + f2 * p[1].y + f3 * p[2].y + f4 * p[3].y) / d,
        z: !_3d ? false : (f1 * p[0].z + f2 * p[1].z + f3 * p[2].z + f4 * p[3].z) / d
      };
    }
  },

  /**
   * Calculates the n-order derivatives of the integral bezier curve defined by {@code points}, where
   * 1 < n ≤ {@code points.length - 1}.
   *
   * @param {Array<{ x: number, y: number, z?: number}>} points - control points of the bezier curve
   * @param {boolean} _3d - whether the control points are defined in 3-space
   * @returns {Array<Array<{ x: number, y: number, z?: number}>>} - control points of each derivative, in order of
   *    ascending derivative order.
   * @see https://pomax.github.io/bezierinfo/#derivatives
   */
  derive: function derive(points, _3d) {
    var dpoints = []; // Control points of each derivative

    var p = points;
    var d = p.length; // Number of control points in curve being differentiated

    var c = d - 1; // Number of control points in the next derivative

    for (; d > 1; d--, c--) {
      var list = new Array(c);

      for (var j = 0; j < c; j++) {
        var dpt = {
          x: c * (p[j + 1].x - p[j].x),
          y: c * (p[j + 1].y - p[j].y)
        };

        if (_3d) {
          dpt.z = c * (p[j + 1].z - p[j].z);
        }

        list[j] = dpt;
      }

      dpoints.push(list);
      p = list;
    }

    return dpoints;
  },
  between: function between(v, m, M) {
    return m <= v && v <= M || utils.approximately(v, m) || utils.approximately(v, M);
  },
  approximately: function approximately(a, b, precision) {
    return abs(a - b) <= (precision || epsilon);
  },
  length: function length(derivativeFn) {
    var z = 0.5;
    var sum = 0;
    var len = utils.Tvalues.length;
    var i;
    var t;

    for (i = 0; i < len; i++) {
      t = z * utils.Tvalues[i] + z;
      sum += utils.Cvalues[i] * utils.arcfn(t, derivativeFn);
    }

    return z * sum;
  },
  map: function map(v, ds, de, ts, te) {
    var d1 = de - ds;
    var d2 = te - ts;
    var v2 = v - ds;
    var r = v2 / d1;
    return ts + d2 * r;
  },
  lerp: function lerp(r, v1, v2) {
    var ret = {
      x: v1.x + r * (v2.x - v1.x),
      y: v1.y + r * (v2.y - v1.y)
    };

    if (!!v1.z && !!v2.z) {
      ret.z = v1.z + r * (v2.z - v1.z);
    }

    return ret;
  },
  pointToString: function pointToString(p) {
    var s = p.x + '/' + p.y;

    if (typeof p.z !== 'undefined') {
      s += '/' + p.z;
    }

    return s;
  },
  pointsToString: function pointsToString(points) {
    return '[' + points.map(utils.pointToString).join(', ') + ']';
  },
  copy: function copy(obj) {
    return JSON.parse(JSON.stringify(obj));
  },
  angle: function angle(o, v1, v2) {
    var dx1 = v1.x - o.x;
    var dy1 = v1.y - o.y;
    var dx2 = v2.x - o.x;
    var dy2 = v2.y - o.y;
    var cross = dx1 * dy2 - dy1 * dx2;
    var dot = dx1 * dx2 + dy1 * dy2;
    return atan2(cross, dot);
  },
  // round as string, to avoid rounding errors
  round: function round(v, d) {
    var s = '' + v;
    var pos = s.indexOf('.');
    return parseFloat(s.substring(0, pos + 1 + d));
  },
  dist: function dist(p1, p2) {
    var dx = p1.x - p2.x;
    var dy = p1.y - p2.y;
    return sqrt(dx * dx + dy * dy);
  },
  closest: function closest(LUT, point) {
    var mdist = pow(2, 63);
    var mpos;
    var d;
    LUT.forEach(function (p, idx) {
      d = utils.dist(point, p);

      if (d < mdist) {
        mdist = d;
        mpos = idx;
      }
    });
    return {
      mdist: mdist,
      mpos: mpos
    };
  },
  abcratio: function abcratio(t, n) {
    // see ratio(t) note on http://pomax.github.io/bezierinfo/#abc
    if (n !== 2 && n !== 3) {
      return false;
    }

    if (typeof t === 'undefined') {
      t = 0.5;
    } else if (t === 0 || t === 1) {
      return t;
    }

    var bottom = pow(t, n) + pow(1 - t, n);
    var top = bottom - 1;
    return abs(top / bottom);
  },
  projectionratio: function projectionratio(t, n) {
    // see u(t) note on http://pomax.github.io/bezierinfo/#abc
    if (n !== 2 && n !== 3) {
      return false;
    }

    if (typeof t === 'undefined') {
      t = 0.5;
    } else if (t === 0 || t === 1) {
      return t;
    }

    var top = pow(1 - t, n);
    var bottom = pow(t, n) + top;
    return top / bottom;
  },
  lli8: function lli8(x1, y1, x2, y2, x3, y3, x4, y4) {
    var nx = (x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4);
    var ny = (x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4);
    var d = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

    if (d === 0) {
      return false;
    }

    return {
      x: nx / d,
      y: ny / d
    };
  },
  lli4: function lli4(p1, p2, p3, p4) {
    return utils.lli8(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y, p4.x, p4.y);
  },
  lli: function lli(v1, v2) {
    return utils.lli4(v1, v1.c, v2, v2.c);
  },
  makeline: function makeline(p1, p2) {
    var x1 = p1.x;
    var y1 = p1.y;
    var x2 = p2.x;
    var y2 = p2.y;
    var dx = (x2 - x1) / 3;
    var dy = (y2 - y1) / 3;
    return new Bezier(x1, y1, x1 + dx, y1 + dy, x1 + 2 * dx, y1 + 2 * dy, x2, y2);
  },
  findbbox: function findbbox(sections) {
    var mx = nMax;
    var my = nMax;
    var MX = nMin;
    var MY = nMin;
    sections.forEach(function (s) {
      var bbox = s.bbox();
      if (mx > bbox.x.min) mx = bbox.x.min;
      if (my > bbox.y.min) my = bbox.y.min;
      if (MX < bbox.x.max) MX = bbox.x.max;
      if (MY < bbox.y.max) MY = bbox.y.max;
    });
    return {
      x: {
        min: mx,
        mid: (mx + MX) / 2,
        max: MX,
        size: MX - mx
      },
      y: {
        min: my,
        mid: (my + MY) / 2,
        max: MY,
        size: MY - my
      }
    };
  },
  shapeintersections: function shapeintersections(s1, bbox1, s2, bbox2, curveIntersectionThreshold) {
    if (!utils.bboxoverlap(bbox1, bbox2)) return [];
    var intersections = [];
    var a1 = [s1.startcap, s1.forward, s1.back, s1.endcap];
    var a2 = [s2.startcap, s2.forward, s2.back, s2.endcap];
    a1.forEach(function (l1) {
      if (l1.virtual) return;
      a2.forEach(function (l2) {
        if (l2.virtual) return;
        var iss = l1.intersects(l2, curveIntersectionThreshold);

        if (iss.length > 0) {
          iss.c1 = l1;
          iss.c2 = l2;
          iss.s1 = s1;
          iss.s2 = s2;
          intersections.push(iss);
        }
      });
    });
    return intersections;
  },
  makeshape: function makeshape(forward, back, curveIntersectionThreshold) {
    var bpl = back.points.length;
    var fpl = forward.points.length;
    var start = utils.makeline(back.points[bpl - 1], forward.points[0]);
    var end = utils.makeline(forward.points[fpl - 1], back.points[0]);
    var shape = {
      startcap: start,
      forward: forward,
      back: back,
      endcap: end,
      bbox: utils.findbbox([start, forward, back, end])
    };
    var self = utils;

    shape.intersections = function (s2) {
      return self.shapeintersections(shape, shape.bbox, s2, s2.bbox, curveIntersectionThreshold);
    };

    return shape;
  },
  getminmax: function getminmax(curve, d, list) {
    if (!list) return {
      min: 0,
      max: 0
    };
    var min = nMax;
    var max = nMin;
    var t;
    var c;

    if (list.indexOf(0) === -1) {
      list = [0].concat(list);
    }

    if (list.indexOf(1) === -1) {
      list.push(1);
    }

    for (var i = 0, len = list.length; i < len; i++) {
      t = list[i];
      c = curve.get(t);

      if (c[d] < min) {
        min = c[d];
      }

      if (c[d] > max) {
        max = c[d];
      }
    }

    return {
      min: min,
      mid: (min + max) / 2,
      max: max,
      size: max - min
    };
  },
  align: function align(points, line) {
    var tx = line.p1.x;
    var ty = line.p1.y;
    var a = -atan2(line.p2.y - ty, line.p2.x - tx);

    var d = function d(v) {
      return {
        x: (v.x - tx) * cos(a) - (v.y - ty) * sin(a),
        y: (v.x - tx) * sin(a) + (v.y - ty) * cos(a)
      };
    };

    return points.map(d);
  },
  roots: function roots(points, line) {
    line = line || {
      p1: {
        x: 0,
        y: 0
      },
      p2: {
        x: 1,
        y: 0
      }
    };
    var order = points.length - 1;
    var p = utils.align(points, line);

    var reduce = function reduce(t) {
      return t >= 0 && t <= 1;
    };

    if (order === 2) {
      var _a = p[0].y;
      var _b = p[1].y;
      var _c = p[2].y;

      var _d = _a - 2 * _b + _c;

      if (_d !== 0) {
        var m1 = -sqrt(_b * _b - _a * _c);
        var m2 = -_a + _b;

        var _v = -(m1 + m2) / _d;

        var v2 = -(-m1 + m2) / _d;
        return [_v, v2].filter(reduce);
      } else if (_b !== _c && _d === 0) {
        return [(2 * _b - _c) / (2 * _b - 2 * _c)].filter(reduce);
      }

      return [];
    } // see http://www.trans4mind.com/personal_development/mathematics/polynomials/cubicAlgebra.htm


    var pa = p[0].y;
    var pb = p[1].y;
    var pc = p[2].y;
    var pd = p[3].y;
    var d = -pa + 3 * pb - 3 * pc + pd;
    var a = 3 * pa - 6 * pb + 3 * pc;
    var b = -3 * pa + 3 * pb;
    var c = pa;

    if (utils.approximately(d, 0)) {
      // this is not a cubic curve.
      if (utils.approximately(a, 0)) {
        // in fact, this is not a quadratic curve either.
        if (utils.approximately(b, 0)) {
          // in fact in fact, there are no solutions.
          return [];
        } // linear solution:


        return [-c / b].filter(reduce);
      } // quadratic solution:


      var q = sqrt(b * b - 4 * a * c);
      var a2 = 2 * a;
      return [(q - b) / a2, (-b - q) / a2].filter(reduce);
    } // at this point, we know we need a cubic solution:


    a /= d;
    b /= d;
    c /= d;
    p = (3 * b - a * a) / 3;
    var p3 = p / 3;
    q = (2 * a * a * a - 9 * a * b + 27 * c) / 27;
    var q2 = q / 2;
    var discriminant = q2 * q2 + p3 * p3 * p3;
    var u1;
    var v1;
    var x1;
    var x2;
    var x3;

    if (discriminant < 0) {
      var mp3 = -p / 3;
      var mp33 = mp3 * mp3 * mp3;
      var r = sqrt(mp33);
      var t = -q / (2 * r);
      var cosphi = t < -1 ? -1 : t > 1 ? 1 : t;
      var phi = acos(cosphi);
      var crtr = crt(r);
      var t1 = 2 * crtr;
      x1 = t1 * cos(phi / 3) - a / 3;
      x2 = t1 * cos((phi + tau) / 3) - a / 3;
      x3 = t1 * cos((phi + 2 * tau) / 3) - a / 3;
      return [x1, x2, x3].filter(reduce);
    } else if (discriminant === 0) {
      u1 = q2 < 0 ? crt(-q2) : -crt(q2);
      x1 = 2 * u1 - a / 3;
      x2 = -u1 - a / 3;
      return [x1, x2].filter(reduce);
    } else {
      var sd = sqrt(discriminant);
      u1 = crt(-q2 + sd);
      v1 = crt(q2 + sd);
      return [u1 - v1 - a / 3].filter(reduce);
    }
  },
  droots: function droots(p) {
    // quadratic roots are easy
    if (p.length === 3) {
      var a = p[0];
      var b = p[1];
      var c = p[2];
      var d = a - 2 * b + c;

      if (d !== 0) {
        var m1 = -sqrt(b * b - a * c);
        var m2 = -a + b;
        var v1 = -(m1 + m2) / d;
        var v2 = -(-m1 + m2) / d;
        return [v1, v2];
      } else if (b !== c && d === 0) {
        return [(2 * b - c) / (2 * (b - c))];
      }

      return [];
    } // linear roots are even easier


    if (p.length === 2) {
      var _a2 = p[0];
      var _b2 = p[1];

      if (_a2 !== _b2) {
        return [_a2 / (_a2 - _b2)];
      }

      return [];
    }
  },
  curvature: function curvature(t, points, _3d, kOnly) {
    var dpoints = utils.derive(points);
    var d1 = dpoints[0];
    var d2 = dpoints[1];
    var num;
    var dnm;
    var adk;
    var dk;
    var k = 0;
    var r = 0; //
    // We're using the following formula for curvature:
    //
    //              x'y" - y'x"
    //   k(t) = ------------------
    //           (x'² + y'²)^(3/2)
    //
    // from https://en.wikipedia.org/wiki/Radius_of_curvature#Definition
    //
    // With it corresponding 3D counterpart:
    //
    //          sqrt( (y'z" - y"z')² + (z'x" - z"x')² + (x'y" - x"y')²)
    //   k(t) = -------------------------------------------------------
    //                     (x'² + y'² + z'²)^(3/2)
    //

    var d = utils.compute(t, d1);
    var dd = utils.compute(t, d2);
    var qdsum = d.x * d.x + d.y * d.y;

    if (_3d) {
      num = sqrt(pow(d.y * dd.z - dd.y * d.z, 2) + pow(d.z * dd.x - dd.z * d.x, 2) + pow(d.x * dd.y - dd.x * d.y, 2));
      dnm = pow(qdsum + d.z * d.z, 3 / 2);
    } else {
      num = d.x * dd.y - d.y * dd.x;
      dnm = pow(qdsum, 3 / 2);
    }

    if (num === 0 || dnm === 0) {
      return {
        k: 0,
        r: 0
      };
    }

    k = num / dnm;
    r = dnm / num; // We're also computing the derivative of kappa, because
    // there is value in knowing the rate of change for the
    // curvature along the curve. And we're just going to
    // ballpark it based on an epsilon.

    if (!kOnly) {
      // compute k'(t) based on the interval before, and after it,
      // to at least try to not introduce forward/backward pass bias.
      var pk = utils.curvature(t - 0.001, points, _3d, true).k;
      var nk = utils.curvature(t + 0.001, points, _3d, true).k;
      dk = (nk - k + (k - pk)) / 2;
      adk = (abs(nk - k) + abs(k - pk)) / 2;
    }

    return {
      k: k,
      r: r,
      dk: dk,
      adk: adk
    };
  },
  inflections: function inflections(points) {
    if (points.length < 4) return []; // FIXME: TODO: add in inflection abstraction for quartic+ curves?

    var p = utils.align(points, {
      p1: points[0],
      p2: points.slice(-1)[0]
    });
    var a = p[2].x * p[1].y;
    var b = p[3].x * p[1].y;
    var c = p[1].x * p[2].y;
    var d = p[3].x * p[2].y;
    var v1 = 18 * (-3 * a + 2 * b + 3 * c - d);
    var v2 = 18 * (3 * a - b - 3 * c);
    var v3 = 18 * (c - a);

    if (utils.approximately(v1, 0)) {
      if (!utils.approximately(v2, 0)) {
        var t = -v3 / v2;
        if (t >= 0 && t <= 1) return [t];
      }

      return [];
    }

    var trm = v2 * v2 - 4 * v1 * v3;
    var sq = Math.sqrt(trm);
    d = 2 * v1;
    if (utils.approximately(d, 0)) return [];
    return [(sq - v2) / d, -(v2 + sq) / d].filter(function (r) {
      return r >= 0 && r <= 1;
    });
  },
  bboxoverlap: function bboxoverlap(b1, b2) {
    var dims = ['x', 'y'];
    var len = dims.length;
    var i;
    var dim;
    var l;
    var t;
    var d;

    for (i = 0; i < len; i++) {
      dim = dims[i];
      l = b1[dim].mid;
      t = b2[dim].mid;
      d = (b1[dim].size + b2[dim].size) / 2;
      if (abs(l - t) >= d) return false;
    }

    return true;
  },
  expandbox: function expandbox(bbox, _bbox) {
    if (_bbox.x.min < bbox.x.min) {
      bbox.x.min = _bbox.x.min;
    }

    if (_bbox.y.min < bbox.y.min) {
      bbox.y.min = _bbox.y.min;
    }

    if (_bbox.z && _bbox.z.min < bbox.z.min) {
      bbox.z.min = _bbox.z.min;
    }

    if (_bbox.x.max > bbox.x.max) {
      bbox.x.max = _bbox.x.max;
    }

    if (_bbox.y.max > bbox.y.max) {
      bbox.y.max = _bbox.y.max;
    }

    if (_bbox.z && _bbox.z.max > bbox.z.max) {
      bbox.z.max = _bbox.z.max;
    }

    bbox.x.mid = (bbox.x.min + bbox.x.max) / 2;
    bbox.y.mid = (bbox.y.min + bbox.y.max) / 2;

    if (bbox.z) {
      bbox.z.mid = (bbox.z.min + bbox.z.max) / 2;
    }

    bbox.x.size = bbox.x.max - bbox.x.min;
    bbox.y.size = bbox.y.max - bbox.y.min;

    if (bbox.z) {
      bbox.z.size = bbox.z.max - bbox.z.min;
    }
  },
  pairiteration: function pairiteration(c1, c2, curveIntersectionThreshold) {
    var c1b = c1.bbox();
    var c2b = c2.bbox();
    var r = 100000;
    var threshold = curveIntersectionThreshold || 0.5;

    if (c1b.x.size + c1b.y.size < threshold && c2b.x.size + c2b.y.size < threshold) {
      return [(r * (c1._t1 + c1._t2) / 2 | 0) / r + '/' + (r * (c2._t1 + c2._t2) / 2 | 0) / r];
    }

    var cc1 = c1.split(0.5);
    var cc2 = c2.split(0.5);
    var pairs = [{
      left: cc1.left,
      right: cc2.left
    }, {
      left: cc1.left,
      right: cc2.right
    }, {
      left: cc1.right,
      right: cc2.right
    }, {
      left: cc1.right,
      right: cc2.left
    }];
    pairs = pairs.filter(function (pair) {
      return utils.bboxoverlap(pair.left.bbox(), pair.right.bbox());
    });
    var results = [];
    if (pairs.length === 0) return results;
    pairs.forEach(function (pair) {
      results = results.concat(utils.pairiteration(pair.left, pair.right, threshold));
    });
    results = results.filter(function (v, i) {
      return results.indexOf(v) === i;
    });
    return results;
  },
  getccenter: function getccenter(p1, p2, p3) {
    var dx1 = p2.x - p1.x;
    var dy1 = p2.y - p1.y;
    var dx2 = p3.x - p2.x;
    var dy2 = p3.y - p2.y;
    var dx1p = dx1 * cos(quart) - dy1 * sin(quart);
    var dy1p = dx1 * sin(quart) + dy1 * cos(quart);
    var dx2p = dx2 * cos(quart) - dy2 * sin(quart);
    var dy2p = dx2 * sin(quart) + dy2 * cos(quart); // chord midpoints

    var mx1 = (p1.x + p2.x) / 2;
    var my1 = (p1.y + p2.y) / 2;
    var mx2 = (p2.x + p3.x) / 2;
    var my2 = (p2.y + p3.y) / 2; // midpoint offsets

    var mx1n = mx1 + dx1p;
    var my1n = my1 + dy1p;
    var mx2n = mx2 + dx2p;
    var my2n = my2 + dy2p; // intersection of these lines:

    var arc = utils.lli8(mx1, my1, mx1n, my1n, mx2, my2, mx2n, my2n);
    var r = utils.dist(arc, p1); // arc start/end values, over mid point:

    var s = atan2(p1.y - arc.y, p1.x - arc.x);
    var m = atan2(p2.y - arc.y, p2.x - arc.x);
    var e = atan2(p3.y - arc.y, p3.x - arc.x);

    var _; // determine arc direction (cw/ccw correction)


    if (s < e) {
      // if s<m<e, arc(s, e)
      // if m<s<e, arc(e, s + tau)
      // if s<e<m, arc(e, s + tau)
      if (s > m || m > e) {
        s += tau;
      }

      if (s > e) {
        _ = e;
        e = s;
        s = _;
      }
    } else {
      // if e<m<s, arc(e, s)
      // if m<e<s, arc(s, e + tau)
      // if e<s<m, arc(s, e + tau)
      if (e < m && m < s) {
        _ = e;
        e = s;
        s = _;
      } else {
        e += tau;
      }
    } // assign and done.


    arc.s = s;
    arc.e = e;
    arc.r = r;
    return arc;
  },
  numberSort: function numberSort(a, b) {
    return a - b;
  }
};

/**
 * {@code PolyBezier} is a spline composed of {@link Bezier} curves.
 */

var PolyBezier = /*#__PURE__*/function () {
  /**
   * Poly Bezier
   * @param {Bezier[]}[curves]
   */
  function PolyBezier(curves) {
    _classCallCheck(this, PolyBezier);

    this.curves = [];
    this._3d = false;

    if (curves) {
      this.curves = curves;
      this._3d = this.curves[0]._3d;
    }
  }

  _createClass(PolyBezier, [{
    key: "valueOf",
    value: function valueOf() {
      return this.toString();
    }
  }, {
    key: "toString",
    value: function toString() {
      return '[' + this.curves.map(function (curve) {
        return utils.pointsToString(curve.points);
      }).join(', ') + ']';
    }
    /**
     * @param {Bezier} curve
     */

  }, {
    key: "addCurve",
    value: function addCurve(curve) {
      this.curves.push(curve);
      this._3d = this._3d || curve._3d;
    }
    /**
     * @returns {number} the sum of the arc lengths of each subcurve
     */

  }, {
    key: "length",
    value: function length() {
      return this.curves.map(function (v) {
        return v.length();
      }).reduce(function (a, b) {
        return a + b;
      });
    }
  }, {
    key: "curve",
    value: function curve(idx) {
      return this.curves[idx];
    }
  }, {
    key: "bbox",
    value: function bbox() {
      var c = this.curves;
      var bbox = c[0].bbox();

      for (var i = 1; i < c.length; i++) {
        utils.expandbox(bbox, c[i].bbox());
      }

      return bbox;
    }
  }, {
    key: "offset",
    value: function offset(d) {
      var offset = [];
      this.curves.forEach(function (v) {
        offset = offset.concat(v.offset(d));
      });
      return new PolyBezier(offset);
    }
  }]);

  return PolyBezier;
}();

/**
 * Normalise an SVG path to absolute coordinates
 * and full commands, rather than relative coordinates
 * and/or shortcut commands.
 */
function normalisePath(d) {
  // preprocess "d" so that we have spaces between values
  d = d.replace(/,/g, ' ') // replace commas with spaces
  .replace(/-/g, ' - ') // add spacing around minus signs
  .replace(/-\s+/g, '-') // remove spacing to the right of minus signs.
  .replace(/([a-zA-Z])/g, ' $1 '); // set up the variables used in this function

  var instructions = d.replace(/([a-zA-Z])\s?/g, '|$1').split('|');
  var instructionLength = instructions.length;
  var i;
  var instruction;
  var op;
  var lop;
  var args = [];
  var alen;
  var a;
  var sx = 0;
  var sy = 0;
  var x = 0;
  var y = 0;
  var cx = 0;
  var cy = 0;
  var cx2 = 0;
  var cy2 = 0;
  var normalized = ''; // we run through the instruction list starting at 1, not 0,
  // because we split up "|M x y ...." so the first element will
  // always be an empty string. By design.

  for (i = 1; i < instructionLength; i++) {
    // which instruction is this?
    instruction = instructions[i];
    op = instruction.substring(0, 1);
    lop = op.toLowerCase(); // what are the arguments? note that we need to convert
    // all strings into numbers, or + will do silly things.

    args = instruction.replace(op, '').trim().split(' ');
    args = args.filter(function (v) {
      return v !== '';
    }).map(parseFloat);
    alen = args.length; // we could use a switch, but elaborate code in a "case" with
    // fallthrough is just horrid to read. So let's use ifthen
    // statements instead.
    // moveto command (plus possible lineto)

    if (lop === 'm') {
      normalized += 'M ';

      if (op === 'm') {
        x += args[0];
        y += args[1];
      } else {
        x = args[0];
        y = args[1];
      } // records start position, for dealing
      // with the shape close operator ('Z')


      sx = x;
      sy = y;
      normalized += x + ' ' + y + ' ';

      if (alen > 2) {
        for (a = 0; a < alen; a += 2) {
          if (op === 'm') {
            x += args[a];
            y += args[a + 1];
          } else {
            x = args[a];
            y = args[a + 1];
          }

          normalized += ['L', x, y, ''].join(' ');
        }
      }
    } else if (lop === 'l') {
      // lineto commands
      for (a = 0; a < alen; a += 2) {
        if (op === 'l') {
          x += args[a];
          y += args[a + 1];
        } else {
          x = args[a];
          y = args[a + 1];
        }

        normalized += ['L', x, y, ''].join(' ');
      }
    } else if (lop === 'h') {
      for (a = 0; a < alen; a++) {
        if (op === 'h') {
          x += args[a];
        } else {
          x = args[a];
        }

        normalized += ['L', x, y, ''].join(' ');
      }
    } else if (lop === 'v') {
      for (a = 0; a < alen; a++) {
        if (op === 'v') {
          y += args[a];
        } else {
          y = args[a];
        }

        normalized += ['L', x, y, ''].join(' ');
      }
    } else if (lop === 'q') {
      // quadratic curveto commands
      for (a = 0; a < alen; a += 4) {
        if (op === 'q') {
          cx = x + args[a];
          cy = y + args[a + 1];
          x += args[a + 2];
          y += args[a + 3];
        } else {
          cx = args[a];
          cy = args[a + 1];
          x = args[a + 2];
          y = args[a + 3];
        }

        normalized += ['Q', cx, cy, x, y, ''].join(' ');
      }
    } else if (lop === 't') {
      for (a = 0; a < alen; a += 2) {
        // reflect previous cx/cy over x/y
        cx = x + (x - cx);
        cy = y + (y - cy); // then get real end point

        if (op === 't') {
          x += args[a];
          y += args[a + 1];
        } else {
          x = args[a];
          y = args[a + 1];
        }

        normalized += ['Q', cx, cy, x, y, ''].join(' ');
      }
    } else if (lop === 'c') {
      // cubic curveto commands
      for (a = 0; a < alen; a += 6) {
        if (op === 'c') {
          cx = x + args[a];
          cy = y + args[a + 1];
          cx2 = x + args[a + 2];
          cy2 = y + args[a + 3];
          x += args[a + 4];
          y += args[a + 5];
        } else {
          cx = args[a];
          cy = args[a + 1];
          cx2 = args[a + 2];
          cy2 = args[a + 3];
          x = args[a + 4];
          y = args[a + 5];
        }

        normalized += ['C', cx, cy, cx2, cy2, x, y, ''].join(' ');
      }
    } else if (lop === 's') {
      for (a = 0; a < alen; a += 4) {
        // reflect previous cx2/cy2 over x/y
        cx = x + (x - cx2);
        cy = y + (y - cy2); // then get real control and end point

        if (op === 's') {
          cx2 = x + args[a];
          cy2 = y + args[a + 1];
          x += args[a + 2];
          y += args[a + 3];
        } else {
          cx2 = args[a];
          cy2 = args[a + 1];
          x = args[a + 2];
          y = args[a + 3];
        }

        normalized += ['C', cx, cy, cx2, cy2, x, y, ''].join(' ');
      }
    } else if (lop === 'z') {
      normalized += 'Z '; // not unimportant: path closing changes the current x/y coordinate

      x = sx;
      y = sy;
    }
  }

  return normalized.trim();
}

var M = {
  x: false,
  y: false
};

function makeBezier(Bezier, term, values) {
  if (term === 'Z') return;

  if (term === 'M') {
    M = {
      x: values[0],
      y: values[1]
    };
    return;
  } // ES7: new Bezier(M.x, M.y, ...values)


  var cvalues = [false, M.x, M.y].concat(values);
  var PreboundConstructor = Bezier.bind.apply(Bezier, cvalues);
  var curve = new PreboundConstructor();
  var last = values.slice(-2);
  M = {
    x: last[0],
    y: last[1]
  };
  return curve;
}

function convertPath(Bezier, d) {
  var terms = normalisePath(d).split(' ');
  var term;
  var matcher = new RegExp('[MLCQZ]', '');
  var segment;
  var values;
  var segments = [];
  var ARGS = {
    C: 6,
    Q: 4,
    L: 2,
    M: 2
  };

  while (terms.length) {
    term = terms.splice(0, 1)[0];

    if (matcher.test(term)) {
      values = terms.splice(0, ARGS[term]).map(parseFloat);
      segment = makeBezier(Bezier, term, values);
      if (segment) segments.push(segment);
    }
  }

  return new Bezier.PolyBezier(segments);
}

var abs$1 = Math.abs;
var min = Math.min;
var max = Math.max;
var cos$1 = Math.cos;
var sin$1 = Math.sin;
var acos$1 = Math.acos;
var sqrt$1 = Math.sqrt;
var pi$1 = Math.PI; // a zero coordinate, which is surprisingly useful

var ZERO$1 = {
  x: 0,
  y: 0,
  z: 0
}; // Components of vectors in 2-space
// const VECTOR2_COMPONENTS = ['x', 'y'];
// Components of vectors in 3-space

var VECTOR3_COMPONENTS = ['x', 'y', 'z'];

function getABC(n, S, B, E, t) {
  if (typeof t === 'undefined') {
    t = 0.5;
  }

  var u = utils.projectionratio(t, n);
  var um = 1 - u;
  var C = {
    x: u * S.x + um * E.x,
    y: u * S.y + um * E.y
  };
  var s = utils.abcratio(t, n);
  var A = {
    x: B.x + (B.x - C.x) / s,
    y: B.y + (B.y - C.y) / s
  };
  return {
    A: A,
    B: B,
    C: C
  };
}

var Bezier = /*#__PURE__*/function () {
  /**
   * Bezier curve constructor. The constructor argument can be one of three things:
   *
   * 1. array/4 of {x:..., y:..., z:...}, z optional
   * 2. numerical array/8 ordered x1,y1,x2,y2,x3,y3,x4,y4
   * 3. numerical array/12 ordered x1,y1,z1,x2,y2,z2,x3,y3,z3,x4,y4,z4
   *
   * @param {*} coords
   */
  function Bezier(coords) {
    var _this = this;

    _classCallCheck(this, Bezier);

    _defineProperty(this, "derivative", function (t) {
      var mt = 1 - t;
      var a;
      var b;
      var c = 0;
      var p = _this.dpoints[0];

      if (_this.order === 2) {
        p = [p[0], p[1], ZERO$1];
        a = mt;
        b = t;
      }

      if (_this.order === 3) {
        a = mt * mt;
        b = mt * t * 2;
        c = t * t;
      }

      var ret = {
        x: a * p[0].x + b * p[1].x + c * p[2].x,
        y: a * p[0].y + b * p[1].y + c * p[2].y
      };

      if (_this._3d) {
        ret.z = a * p[0].z + b * p[1].z + c * p[2].z;
      }

      return ret;
    });

    var args = coords && coords.forEach ? coords : [].slice.call(arguments);
    var coordlen = false;

    if (_typeof(args[0]) === 'object') {
      coordlen = args.length;
      var newargs = [];
      args.forEach(function (point) {
        VECTOR3_COMPONENTS.forEach(function (d) {
          if (typeof point[d] !== 'undefined') {
            newargs.push(point[d]);
          }
        });
      });
      args = newargs;
    }

    var higher = false;
    var len = args.length;

    if (coordlen) {
      if (coordlen > 4) {
        if (arguments.length !== 1) {
          throw new Error('Only new Bezier(point[]) is accepted for 4th and higher order curves');
        }

        higher = true;
      }
    } else {
      if (len !== 6 && len !== 8 && len !== 9 && len !== 12) {
        if (arguments.length !== 1) {
          throw new Error('Only new Bezier(point[]) is accepted for 4th and higher order curves');
        }
      }
    }

    var _3d = !higher && (len === 9 || len === 12) || coords && coords[0] && typeof coords[0].z !== 'undefined';

    this._3d = _3d;
    var points = [];

    for (var idx = 0, step = _3d ? 3 : 2; idx < len; idx += step) {
      var point = {
        x: args[idx],
        y: args[idx + 1]
      };

      if (_3d) {
        point.z = args[idx + 2];
      }

      points.push(point);
    }

    this.order = points.length - 1;
    this.points = points;
    var dims = ['x', 'y'];
    if (_3d) dims.push('z');
    this.dims = dims;
    this.dimlen = dims.length;

    (function (curve) {
      var order = curve.order;
      var points = curve.points;
      var a = utils.align(points, {
        p1: points[0],
        p2: points[order]
      });

      for (var i = 0; i < a.length; i++) {
        if (abs$1(a[i].y) > 0.0001) {
          curve._linear = false;
          return;
        }
      }

      curve._linear = true;
    })(this);

    this._t1 = 0;
    this._t2 = 1;
    this.update();
  }

  _createClass(Bezier, [{
    key: "point",
    value: function point(idx) {
      return this.points[idx];
    }
  }, {
    key: "get",
    value: function get(t) {
      return this.compute(t);
    }
  }, {
    key: "compute",
    value: function compute(t) {
      if (this.ratios) {
        return utils.computeWithRatios(t, this.points, this.ratios, this._3d);
      }

      return utils.compute(t, this.points, this._3d, this.ratios);
    }
    /**
     * @param {number[]} ratios - ratios of each control points
     */

  }, {
    key: "setRatios",
    value: function setRatios(ratios) {
      if (ratios.length !== this.points.length) {
        throw new Error('Incorrect number of ratio values');
      }

      this.ratios = ratios;
      this._lut = []; //  invalidate any precomputed LUT
    }
    /**
     * @param {number} steps
     * @returns {Array<{ x: number, y: number, z?: number}>}
     */

  }, {
    key: "getLUT",
    value: function getLUT(steps) {
      this.verify();
      steps = steps || 100;

      if (this._lut.length === steps) {
        return this._lut;
      }

      this._lut = []; // We want a range from 0 to 1 inclusive, so
      // we decrement and then use <= rather than <:

      steps--;

      for (var t = 0; t <= steps; t++) {
        this._lut.push(this.compute(t / steps));
      }

      return this._lut;
    }
  }, {
    key: "on",
    value: function on(point, error) {
      error = error || 5;
      var lut = this.getLUT();
      var hits = [];
      var c;
      var t = 0;

      for (var i = 0; i < lut.length; i++) {
        c = lut[i];

        if (utils.dist(c, point) < error) {
          hits.push(c);
          t += i / lut.length;
        }
      }

      if (!hits.length) return false;
      return t /= hits.length;
    }
    /**
     * Projects the {@code point} on to this curve.
     *
     * @param {{ x: number, y: number, z?: number }} point
     * @returns {{ x: number, y: number, z?: number }}
     */

  }, {
    key: "project",
    value: function project(point) {
      // step 1: coarse check
      var LUT = this.getLUT();
      var l = LUT.length - 1;
      var closest = utils.closest(LUT, point);
      var mdist = closest.mdist;
      var mpos = closest.mpos; // step 2: fine check

      var ft;
      var t;
      var p;
      var d;
      var t1 = (mpos - 1) / l;
      var t2 = (mpos + 1) / l;
      var step = 0.1 / l;
      mdist += 1;

      for (t = t1, ft = t; t < t2 + step; t += step) {
        p = this.compute(t);
        d = utils.dist(point, p);

        if (d < mdist) {
          mdist = d;
          ft = t;
        }
      }

      p = this.compute(ft);
      p.t = ft;
      p.d = mdist;
      return p;
    }
    /**
     * @returns a {@code Bezier} curve with "n + 1" control points, where "n" is the number of control
     *  points in this curve, equivalent to this curve.
     */

  }, {
    key: "raise",
    value: function raise() {
      var p = this.points;
      var np = [p[0]];
      var k = p.length;
      var pi;
      var pim;

      for (var i = 1; i < k; i++) {
        pi = p[i];
        pim = p[i - 1];
        np[i] = {
          x: (k - i) / k * pi.x + i / k * pim.x,
          y: (k - i) / k * pi.y + i / k * pim.y
        };
      }

      np[k] = p[k - 1];
      return new Bezier(np);
    }
    /**
     * Calculates the arc length of this curve in the interval t ∊ [0,1].
     */

  }, {
    key: "length",
    value: function length() {
      return utils.length(this.derivative.bind(this));
    }
    /**
     * Calculates the tangent vector to this curve at {@code t}. This is equivalent to computing the derivative
     * curve at {@code t}.
     *
     * @param {number} t
     * @returns {{ x: number, y: number, z?: number }}
     * @see https://pomax.github.io/bezierinfo/#derivatives
     */

  }, {
    key: "curvature",
    value: function curvature(t) {
      return utils.curvature(t, this.points, this._3d);
    }
  }, {
    key: "inflections",
    value: function inflections() {
      return utils.inflections(this.points);
    }
  }, {
    key: "normal",
    value: function normal(t) {
      return this._3d ? this.__normal3(t) : this.__normal2(t);
    }
    /**
     * @private
     */

  }, {
    key: "__normal2",
    value: function __normal2(t) {
      var d = this.derivative(t);
      var q = sqrt$1(d.x * d.x + d.y * d.y);
      return {
        x: -d.y / q,
        y: d.x / q
      };
    }
    /**
     * @private
     */

  }, {
    key: "__normal3",
    value: function __normal3(t) {
      // see http://stackoverflow.com/questions/25453159
      var r1 = this.derivative(t);
      var r2 = this.derivative(t + 0.01);
      var q1 = sqrt$1(r1.x * r1.x + r1.y * r1.y + r1.z * r1.z);
      var q2 = sqrt$1(r2.x * r2.x + r2.y * r2.y + r2.z * r2.z);
      r1.x /= q1;
      r1.y /= q1;
      r1.z /= q1;
      r2.x /= q2;
      r2.y /= q2;
      r2.z /= q2; // cross product

      var c = {
        x: r2.y * r1.z - r2.z * r1.y,
        y: r2.z * r1.x - r2.x * r1.z,
        z: r2.x * r1.y - r2.y * r1.x
      };
      var m = sqrt$1(c.x * c.x + c.y * c.y + c.z * c.z);
      c.x /= m;
      c.y /= m;
      c.z /= m; // rotation matrix

      var R = [c.x * c.x, c.x * c.y - c.z, c.x * c.z + c.y, c.x * c.y + c.z, c.y * c.y, c.y * c.z - c.x, c.x * c.z - c.y, c.y * c.z + c.x, c.z * c.z]; // normal vector:

      var n = {
        x: R[0] * r1.x + R[1] * r1.y + R[2] * r1.z,
        y: R[3] * r1.x + R[4] * r1.y + R[5] * r1.z,
        z: R[6] * r1.x + R[7] * r1.y + R[8] * r1.z
      };
      return n;
    }
  }, {
    key: "hull",
    value: function hull(t) {
      var p = this.points;
      var _p = [];
      var pt;
      var q = [];
      var idx = 0;
      var i = 0;
      var l = 0;
      q[idx++] = p[0];
      q[idx++] = p[1];
      q[idx++] = p[2];

      if (this.order === 3) {
        q[idx++] = p[3];
      } // we lerp between all points at each iteration, until we have 1 point left.


      while (p.length > 1) {
        _p = [];

        for (i = 0, l = p.length - 1; i < l; i++) {
          pt = utils.lerp(t, p[i], p[i + 1]);
          q[idx++] = pt;

          _p.push(pt);
        }

        p = _p;
      }

      return q;
    }
    /**
     * Splits the bezier curve
     *
     * + If both {@code t1} and {@code t2} are provided, the curve spanning between the two parameters is returned.
     * + If only {@code t1} is passed, then an both the left (from 0 to {@code t1}) and right (from {@code t1} to 1)
     *    curves are returned.
     *
     * @param {number} t1
     * @param {number} t2
     * @returns {Bezier | {
     *  left: Bezier,
     *  right: Bezier,
     *  span: number
     * }}
     */

  }, {
    key: "split",
    value: function split(t1, t2) {
      // shortcuts
      if (t1 === 0 && !!t2) {
        return this.split(t2).left;
      }

      if (t2 === 1) {
        return this.split(t1).right;
      } // no shortcut: use "de Casteljau" iteration.


      var q = this.hull(t1);
      var result = {
        left: this.order === 2 ? new Bezier([q[0], q[3], q[5]]) : new Bezier([q[0], q[4], q[7], q[9]]),
        right: this.order === 2 ? new Bezier([q[5], q[4], q[2]]) : new Bezier([q[9], q[8], q[6], q[3]]),
        span: q
      }; // make sure we bind _t1/_t2 information!

      result.left._t1 = utils.map(0, 0, 1, this._t1, this._t2);
      result.left._t2 = utils.map(t1, 0, 1, this._t1, this._t2);
      result.right._t1 = utils.map(t1, 0, 1, this._t1, this._t2);
      result.right._t2 = utils.map(1, 0, 1, this._t1, this._t2); // if we have no t2, we're done

      if (!t2) {
        return result;
      } // if we have a t2, split again:


      t2 = utils.map(t2, t1, 1, 0, 1);
      var subsplit = result.right.split(t2);
      return subsplit.left;
    }
  }, {
    key: "extrema",
    value: function extrema() {
      var dims = this.dims;
      var result = {};
      var roots = [];
      var p;
      var mfn;
      dims.forEach(function (dim) {
        mfn = function mfn(v) {
          return v[dim];
        };

        p = this.dpoints[0].map(mfn);
        result[dim] = utils.droots(p);

        if (this.order === 3) {
          p = this.dpoints[1].map(mfn);
          result[dim] = result[dim].concat(utils.droots(p));
        }

        result[dim] = result[dim].filter(function (t) {
          return t >= 0 && t <= 1;
        });
        roots = roots.concat(result[dim].sort(utils.numberSort));
      }.bind(this));
      roots = roots.sort(utils.numberSort).filter(function (v, idx) {
        return roots.indexOf(v) === idx;
      });
      result.values = roots;
      return result;
    }
  }, {
    key: "bbox",
    value: function bbox() {
      var extrema = this.extrema();
      var result = {};
      this.dims.forEach(function (d) {
        result[d] = utils.getminmax(this, d, extrema[d]);
      }.bind(this));
      return result;
    }
  }, {
    key: "overlaps",
    value: function overlaps(curve) {
      var lbbox = this.bbox();
      var tbbox = curve.bbox();
      return utils.bboxoverlap(lbbox, tbbox);
    }
  }, {
    key: "offset",
    value: function offset(t, d) {
      if (typeof d !== 'undefined') {
        var c = this.get(t);
        var n = this.normal(t);
        var ret = {
          c: c,
          n: n,
          x: c.x + n.x * d,
          y: c.y + n.y * d
        };

        if (this._3d) {
          ret.z = c.z + n.z * d;
        }

        return ret;
      }

      if (this._linear) {
        var nv = this.normal(0);
        var coords = this.points.map(function (p) {
          var ret = {
            x: p.x + t * nv.x,
            y: p.y + t * nv.y
          };

          if (p.z && n.z) {
            ret.z = p.z + t * nv.z;
          }

          return ret;
        });
        return [new Bezier(coords)];
      }

      var reduced = this.reduce();
      return reduced.map(function (s) {
        if (s._linear) {
          return s.offset(t)[0];
        }

        return s.scale(t);
      });
    }
    /**
     * @returns {boolean} whether this curve is "simple"
     */

  }, {
    key: "simple",
    value: function simple() {
      if (this.order === 3) {
        var a1 = utils.angle(this.points[0], this.points[3], this.points[1]);
        var a2 = utils.angle(this.points[0], this.points[3], this.points[2]);
        if (a1 > 0 && a2 < 0 || a1 < 0 && a2 > 0) return false;
      }

      var n1 = this.normal(0);
      var n2 = this.normal(1);
      var s = n1.x * n2.x + n1.y * n2.y;

      if (this._3d) {
        s += n1.z * n2.z;
      }

      var angle = abs$1(acos$1(s));
      return angle < pi$1 / 3;
    }
  }, {
    key: "reduce",
    value: function reduce() {
      var i;
      var t1 = 0;
      var t2 = 0;
      var step = 0.01;
      var segment;
      var pass1 = [];
      var pass2 = []; // first pass: split on extrema

      var extrema = this.extrema().values;

      if (extrema.indexOf(0) === -1) {
        extrema = [0].concat(extrema);
      }

      if (extrema.indexOf(1) === -1) {
        extrema.push(1);
      }

      for (t1 = extrema[0], i = 1; i < extrema.length; i++) {
        t2 = extrema[i];
        segment = this.split(t1, t2);
        segment._t1 = t1;
        segment._t2 = t2;
        pass1.push(segment);
        t1 = t2;
      } // second pass: further reduce these segments to simple segments


      pass1.forEach(function (p1) {
        t1 = 0;
        t2 = 0;

        while (t2 <= 1) {
          for (t2 = t1 + step; t2 <= 1 + step; t2 += step) {
            segment = p1.split(t1, t2);

            if (!segment.simple()) {
              t2 -= step;

              if (abs$1(t1 - t2) < step) {
                // we can never form a reduction
                return [];
              }

              segment = p1.split(t1, t2);
              segment._t1 = utils.map(t1, 0, 1, p1._t1, p1._t2);
              segment._t2 = utils.map(t2, 0, 1, p1._t1, p1._t2);
              pass2.push(segment);
              t1 = t2;
              break;
            }
          }
        }

        if (t1 < 1) {
          segment = p1.split(t1, 1);
          segment._t1 = utils.map(t1, 0, 1, p1._t1, p1._t2);
          segment._t2 = p1._t2;
          pass2.push(segment);
        }
      });
      return pass2;
    }
  }, {
    key: "scale",
    value: function scale(d) {
      var order = this.order;
      var distanceFn = false;

      if (typeof d === 'function') {
        distanceFn = d;
      }

      if (distanceFn && order === 2) {
        return this.raise().scale(distanceFn);
      } // TODO: add special handling for degenerate (=linear) curves.


      var clockwise = this.clockwise;
      var r1 = distanceFn ? distanceFn(0) : d;
      var r2 = distanceFn ? distanceFn(1) : d;
      var v = [this.offset(0, 10), this.offset(1, 10)];
      var o = utils.lli4(v[0], v[0].c, v[1], v[1].c);

      if (!o) {
        throw new Error('cannot scale this curve. Try reducing it first.');
      } // move all points by distance 'd' wrt the origin 'o'


      var points = this.points;
      var np = []; // move end points by fixed distance along normal.

      [0, 1].forEach(function (t) {
        var p = np[t * order] = utils.copy(points[t * order]);
        p.x += (t ? r2 : r1) * v[t].n.x;
        p.y += (t ? r2 : r1) * v[t].n.y;
      });

      if (!distanceFn) {
        // move control points to lie on the intersection of the offset
        // derivative vector, and the origin-through-control vector
        [0, 1].forEach(function (t) {
          if (this.order === 2 && !!t) return;
          var p = np[t * order];
          var d = this.derivative(t);
          var p2 = {
            x: p.x + d.x,
            y: p.y + d.y
          };
          np[t + 1] = utils.lli4(p, p2, o, points[t + 1]);
        }.bind(this));
        return new Bezier(np);
      } // move control points by "however much necessary to
      // ensure the correct tangent to endpoint".


      [0, 1].forEach(function (t) {
        if (this.order === 2 && !!t) return;
        var p = points[t + 1];
        var ov = {
          x: p.x - o.x,
          y: p.y - o.y
        };
        var rc = distanceFn ? distanceFn((t + 1) / order) : d;
        if (distanceFn && !clockwise) rc = -rc;
        var m = sqrt$1(ov.x * ov.x + ov.y * ov.y);
        ov.x /= m;
        ov.y /= m;
        np[t + 1] = {
          x: p.x + rc * ov.x,
          y: p.y + rc * ov.y
        };
      }.bind(this));
      return new Bezier(np);
    }
  }, {
    key: "outline",
    value: function outline(d1, d2, d3, d4) {
      d2 = typeof d2 === 'undefined' ? d1 : d2;
      var reduced = this.reduce();
      var len = reduced.length;
      var fcurves = [];
      var bcurves = [];
      var p;
      var alen = 0;
      var tlen = this.length();
      var graduated = typeof d3 !== 'undefined' && typeof d4 !== 'undefined';

      function linearDistanceFunction(s, e, tlen, alen, slen) {
        return function (v) {
          var f1 = alen / tlen;
          var f2 = (alen + slen) / tlen;
          var d = e - s;
          return utils.map(v, 0, 1, s + f1 * d, s + f2 * d);
        };
      } // form curve oulines


      reduced.forEach(function (segment) {
        slen = segment.length();

        if (graduated) {
          fcurves.push(segment.scale(linearDistanceFunction(d1, d3, tlen, alen, slen)));
          bcurves.push(segment.scale(linearDistanceFunction(-d2, -d4, tlen, alen, slen)));
        } else {
          fcurves.push(segment.scale(d1));
          bcurves.push(segment.scale(-d2));
        }

        alen += slen;
      }); // reverse the "return" outline

      bcurves = bcurves.map(function (s) {
        p = s.points;

        if (p[3]) {
          s.points = [p[3], p[2], p[1], p[0]];
        } else {
          s.points = [p[2], p[1], p[0]];
        }

        return s;
      }).reverse(); // form the endcaps as lines

      var fs = fcurves[0].points[0];
      var fe = fcurves[len - 1].points[fcurves[len - 1].points.length - 1];
      var bs = bcurves[len - 1].points[bcurves[len - 1].points.length - 1];
      var be = bcurves[0].points[0];
      var ls = utils.makeline(bs, fs);
      var le = utils.makeline(fe, be);
      var segments = [ls].concat(fcurves).concat([le]).concat(bcurves);
      var slen = segments.length;
      return new PolyBezier(segments);
    }
    /**
     * @private
     */

  }, {
    key: "outlineshapes",
    value: function outlineshapes(d1, d2, curveIntersectionThreshold) {
      d2 = d2 || d1;
      var outline = this.outline(d1, d2).curves;
      var shapes = [];

      for (var i = 1, len = outline.length; i < len / 2; i++) {
        var shape = utils.makeshape(outline[i], outline[len - i], curveIntersectionThreshold);
        shape.startcap.virtual = i > 1;
        shape.endcap.virtual = i < len / 2 - 1;
        shapes.push(shape);
      }

      return shapes;
    }
    /**
     *
     * @param {Bezier}[curve=this]
     * @param {number} curveIntersectionThreshold
     */

  }, {
    key: "intersects",
    value: function intersects(curve, curveIntersectionThreshold) {
      if (!curve) return this.selfintersects(curveIntersectionThreshold);

      if (curve.p1 && curve.p2) {
        return this.lineIntersects(curve);
      }

      if (curve instanceof Bezier) {
        curve = curve.reduce();
      }

      return this.curveintersects(this.reduce(), curve, curveIntersectionThreshold);
    }
  }, {
    key: "lineIntersects",
    value: function lineIntersects(line) {
      var mx = min(line.p1.x, line.p2.x);
      var my = min(line.p1.y, line.p2.y);
      var MX = max(line.p1.x, line.p2.x);
      var MY = max(line.p1.y, line.p2.y);
      var self = this;
      return utils.roots(this.points, line).filter(function (t) {
        var p = self.get(t);
        return utils.between(p.x, mx, MX) && utils.between(p.y, my, MY);
      });
    }
  }, {
    key: "selfintersects",
    value: function selfintersects(curveIntersectionThreshold) {
      var reduced = this.reduce(); // "simple" curves cannot intersect with their direct
      // neighbour, so for each segment X we check whether
      // it intersects [0:x-2][x+2:last].

      var i;
      var len = reduced.length - 2;
      var results = [];
      var result;
      var left;
      var right;

      for (i = 0; i < len; i++) {
        left = reduced.slice(i, i + 1);
        right = reduced.slice(i + 2);
        result = this.curveintersects(left, right, curveIntersectionThreshold);
        results = results.concat(result);
      }

      return results;
    }
  }, {
    key: "curveintersects",
    value: function curveintersects(c1, c2, curveIntersectionThreshold) {
      var pairs = []; // step 1: pair off any overlapping segments

      c1.forEach(function (l) {
        c2.forEach(function (r) {
          if (l.overlaps(r)) {
            pairs.push({
              left: l,
              right: r
            });
          }
        });
      }); // step 2: for each pairing, run through the convergence algorithm.

      var intersections = [];
      pairs.forEach(function (pair) {
        var result = utils.pairiteration(pair.left, pair.right, curveIntersectionThreshold);

        if (result.length > 0) {
          intersections = intersections.concat(result);
        }
      });
      return intersections;
    }
  }, {
    key: "arcs",
    value: function arcs(errorThreshold) {
      errorThreshold = errorThreshold || 0.5;
      var circles = [];
      return this._iterate(errorThreshold, circles);
    }
    /**
     * @private
     */

  }, {
    key: "_error",
    value: function _error(pc, np1, s, e) {
      var q = (e - s) / 4;
      var c1 = this.get(s + q);
      var c2 = this.get(e - q);
      var ref = utils.dist(pc, np1);
      var d1 = utils.dist(pc, c1);
      var d2 = utils.dist(pc, c2);
      return abs$1(d1 - ref) + abs$1(d2 - ref);
    }
  }, {
    key: "_iterate",
    value: function _iterate(errorThreshold, circles) {
      /* eslint-disable camelcase */
      var t_s = 0;
      var t_e = 1;
      var safety; // we do a binary search to find the "good `t` closest to no-longer-good"

      do {
        safety = 0; // step 1: start with the maximum possible arc

        t_e = 1; // points:

        var np1 = this.get(t_s);
        var np2;
        var np3;
        var arc;
        var prev_arc; // booleans:

        var curr_good = false;
        var prev_good = false;
        var done; // numbers:

        var t_m = t_e;
        var prev_e = 1; // step 2: find the best possible arc

        do {
          prev_good = curr_good;
          prev_arc = arc;
          t_m = (t_s + t_e) / 2;
          np2 = this.get(t_m);
          np3 = this.get(t_e);
          arc = utils.getccenter(np1, np2, np3); // also save the t values

          arc.interval = {
            start: t_s,
            end: t_e
          };

          var error = this._error(arc, np1, t_s, t_e);

          curr_good = error <= errorThreshold;
          done = prev_good && !curr_good;
          if (!done) prev_e = t_e; // this arc is fine: we can move 'e' up to see if we can find a wider arc

          if (curr_good) {
            // if e is already at max, then we're done for this arc.
            if (t_e >= 1) {
              // make sure we cap at t=1
              arc.interval.end = prev_e = 1;
              prev_arc = arc; // if we capped the arc segment to t=1 we also need to make sure that
              // the arc's end angle is correct with respect to the bezier end point.

              if (t_e > 1) {
                var d = {
                  x: arc.x + arc.r * cos$1(arc.e),
                  y: arc.y + arc.r * sin$1(arc.e)
                };
                arc.e += utils.angle({
                  x: arc.x,
                  y: arc.y
                }, d, this.get(1));
              }

              break;
            } // if not, move it up by half the iteration distance


            t_e = t_e + (t_e - t_s) / 2;
          } else {
            // this is a bad arc: we need to move 'e' down to find a good arc
            t_e = t_m;
          }
        } while (!done && safety++ < 100);

        if (safety >= 100) {
          break;
        } // console.log("L835: [F] arc found", t_s, prev_e, prev_arc.x, prev_arc.y, prev_arc.s, prev_arc.e);


        prev_arc = prev_arc || arc;
        circles.push(prev_arc);
        t_s = prev_e;
      } while (t_e < 1);
      /* eslint-enable camelcase */


      return circles;
    }
  }, {
    key: "getUtils",
    value: function getUtils() {
      return utils;
    }
  }, {
    key: "valueOf",
    value: function valueOf() {
      return this.toString();
    }
    /**
     * @returns a string representation of this bezier
     */

  }, {
    key: "toString",
    value: function toString() {
      return utils.pointsToString(this.points);
    }
    /**
     * @returns {string | boolean} - SVG string to draw this curve; {@code false} is returned for curves
     *  in 3-space because they are not supported.
     */

  }, {
    key: "toSVG",
    value: function toSVG() {
      if (this._3d) {
        return false;
      }

      var p = this.points;
      var x = p[0].x;
      var y = p[0].y;
      var s = ['M', x, y, this.order === 2 ? 'Q' : 'C'];

      for (var i = 1, last = p.length; i < last; i++) {
        s.push(p[i].x);
        s.push(p[i].y);
      }

      return s.join(' ');
    }
    /**
     * @private
     */

  }, {
    key: "verify",
    value: function verify() {
      var print = this.coordDigest();

      if (print !== this._print) {
        this._print = print;
        this.update();
      }
    }
    /**
     * @private
     */

  }, {
    key: "coordDigest",
    value: function coordDigest() {
      return this.points.map(function (controlPoint, i) {
        return '' + i + controlPoint.x + controlPoint.y + (controlPoint.z || 0);
      }).join('');
    }
    /**
     * This should be invoked whenever data has been modified. It will invalidate any caches (including the
     * lookup tables) and does some recalculations.
     *
     * @private
     * @param {} newprint - unused parameter?
     */

  }, {
    key: "update",
    value: function update(newprint) {
      // invalidate any precomputed LUT
      this._lut = [];
      this.dpoints = utils.derive(this.points, this._3d);
      this.computedirection();
    }
  }, {
    key: "computedirection",
    value: function computedirection() {
      var points = this.points;
      var angle = utils.angle(points[0], points[this.order], points[1]);
      this.clockwise = angle > 0;
    }
    /**
     * turn an svg <path> d attribute into a sequence of Bezier segments.
     */

  }], [{
    key: "SVGtoBeziers",
    value: function SVGtoBeziers(d) {
      return convertPath(Bezier, d);
    }
  }, {
    key: "quadraticFromPoints",
    value: function quadraticFromPoints(p1, p2, p3, t) {
      if (typeof t === 'undefined') {
        t = 0.5;
      } // shortcuts, although they're really dumb


      if (t === 0) {
        return new Bezier(p2, p2, p3);
      }

      if (t === 1) {
        return new Bezier(p1, p2, p2);
      } // real fitting.


      var abc = getABC(2, p1, p2, p3, t);
      return new Bezier(p1, abc.A, p3);
    }
  }, {
    key: "cubicFromPoints",
    value: function cubicFromPoints(S, B, E, t, d1) {
      if (typeof t === 'undefined') {
        t = 0.5;
      }

      var abc = getABC(3, S, B, E, t);

      if (typeof d1 === 'undefined') {
        d1 = utils.dist(B, abc.C);
      }

      var d2 = d1 * (1 - t) / t;
      var selen = utils.dist(S, E);
      var lx = (E.x - S.x) / selen;
      var ly = (E.y - S.y) / selen;
      var bx1 = d1 * lx;
      var by1 = d1 * ly;
      var bx2 = d2 * lx;
      var by2 = d2 * ly; // derivation of new hull coordinates

      var e1 = {
        x: B.x - bx1,
        y: B.y - by1
      };
      var e2 = {
        x: B.x + bx2,
        y: B.y + by2
      };
      var A = abc.A;
      var v1 = {
        x: A.x + (e1.x - A.x) / (1 - t),
        y: A.y + (e1.y - A.y) / (1 - t)
      };
      var v2 = {
        x: A.x + (e2.x - A.x) / t,
        y: A.y + (e2.y - A.y) / t
      };
      var nc1 = {
        x: S.x + (v1.x - S.x) / t,
        y: S.y + (v1.y - S.y) / t
      };
      var nc2 = {
        x: E.x + (v2.x - E.x) / (1 - t),
        y: E.y + (v2.y - E.y) / (1 - t)
      }; // ...done

      return new Bezier(S, nc1, nc2, E);
    }
  }, {
    key: "getUtils",
    value: function getUtils() {
      return utils;
    }
  }]);

  return Bezier;
}();

_defineProperty(Bezier, "PolyBezier", PolyBezier);

export default Bezier;
export { Bezier };
//# sourceMappingURL=bezier.es.js.map
