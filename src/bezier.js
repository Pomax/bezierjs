/**
  A javascript Bezier curve library by Pomax.

  Based on http://pomax.github.io/bezierinfo

  This code is MIT licensed.
**/

import { utils } from "./utils.js";
import { PolyBezier } from "./poly-bezier.js";
import {
  Line2D,
  Line3D,
  Quadratic2D,
  Quadratic3D,
  Cubic2D,
  Cubic3D,
  HigherOrder,
} from "./types/index.js";

// prototype shenanigans
const setProto = (x, T) => Object.setPrototypeOf(x, T.prototype);

/**
 * Bezier curve constructor.
 */
const Bezier = function (coords) {
  let args = coords && coords.forEach ? coords : Array.from(arguments).slice();
  let coordlen = false;

  if (typeof args[0] === "object") {
    coordlen = args.length;
    const newargs = [];
    args.forEach(function (point) {
      ["x", "y", "z"].forEach(function (d) {
        if (typeof point[d] !== "undefined") {
          newargs.push(point[d]);
        }
      });
    });
    args = newargs;
  }

  let higher = false;
  const len = args.length;

  if (coordlen) {
    if (coordlen > 4) {
      if (arguments.length !== 1) {
        throw new Error(
          "Only new Bezier(point[]) is accepted for 4th and higher order curves"
        );
      }
      higher = true;
    }
  } else {
    if (len !== 6 && len !== 8 && len !== 9 && len !== 12) {
      if (arguments.length !== 1) {
        throw new Error(
          "Only new Bezier(point[]) is accepted for 4th and higher order curves"
        );
      }
    }
  }

  const _3d = (this._3d =
    (!higher && (len === 9 || len === 12)) ||
    (coords && coords[0] && typeof coords[0].z !== "undefined"));

  const points = (this.points = []);
  for (let idx = 0, step = _3d ? 3 : 2; idx < len; idx += step) {
    var point = {
      x: args[idx],
      y: args[idx + 1],
    };
    if (_3d) {
      point.z = args[idx + 2];
    }
    points.push(point);
  }

  const dims = (this.dims = ["x", "y"]);
  if (_3d) dims.push("z");
  this.dimlen = dims.length;

  // Magic prototype rewriting, so that users create
  // a Bezier object, but the actual special case code
  // for each of the low dimension curve can live in
  // its own class.
  Object.defineProperty(this, `__cast__`, {
    value: () => {
      const _3d = (this._3d = typeof points[0].z !== `undefined`);
      const order = (this.order = points.length - 1);
      this._linear = utils.isLinear(points, order);
      this._lut = [];
      if (_3d) {
        if (order === 1) setProto(this, Line3D);
        else if (order === 2) setProto(this, Quadratic3D);
        else if (order === 3) setProto(this, Cubic3D);
        else setProto(this, HigherOrder);
      } else {
        if (order === 1) setProto(this, Line2D);
        else if (order === 2) setProto(this, Quadratic2D);
        else if (order === 3) setProto(this, Cubic2D);
        else setProto(this, HigherOrder);
      }

      this.update();
    },
    enumerable: false,
    writable: false,
  });

  this._t1 = 0;
  this._t2 = 1;
  this.__cast__();
};

Bezier.TYPES = [
  Line2D,
  Line3D,
  Quadratic2D,
  Quadratic3D,
  Cubic2D,
  Cubic3D,
  HigherOrder,
];

Bezier.PolyBezier = PolyBezier;

Bezier.getUtils = function getUtils() {
  return utils;
};

Bezier.quadraticFromPoints = function quadraticFromPoints(p1, p2, p3, t) {
  if (typeof t === "undefined") {
    t = 0.5;
  }
  // shortcuts, although they're really dumb
  if (t === 0) {
    return new Bezier(p2, p2, p3);
  }
  if (t === 1) {
    return new Bezier(p1, p2, p2);
  }
  // real fitting.
  const abc = utils.abc(2, p1, p2, p3, t);
  return new Bezier(p1, abc.A, p3);
};

Bezier.cubicFromPoints = function cubicFromPoints(S, B, E, t, d1) {
  if (typeof t === "undefined") {
    t = 0.5;
  }
  const abc = utils.abc(3, S, B, E, t);
  if (typeof d1 === "undefined") {
    d1 = utils.dist(B, abc.C);
  }
  const d2 = (d1 * (1 - t)) / t;

  const selen = utils.dist(S, E),
    lx = (E.x - S.x) / selen,
    ly = (E.y - S.y) / selen,
    bx1 = d1 * lx,
    by1 = d1 * ly,
    bx2 = d2 * lx,
    by2 = d2 * ly;
  // derivation of new hull coordinates
  const e1 = { x: B.x - bx1, y: B.y - by1 },
    e2 = { x: B.x + bx2, y: B.y + by2 },
    A = abc.A,
    v1 = { x: A.x + (e1.x - A.x) / (1 - t), y: A.y + (e1.y - A.y) / (1 - t) },
    v2 = { x: A.x + (e2.x - A.x) / t, y: A.y + (e2.y - A.y) / t },
    nc1 = { x: S.x + (v1.x - S.x) / t, y: S.y + (v1.y - S.y) / t },
    nc2 = {
      x: E.x + (v2.x - E.x) / (1 - t),
      y: E.y + (v2.y - E.y) / (1 - t),
    };
  // ...done
  return new Bezier(S, nc1, nc2, E);
};

HigherOrder.setBezierConstructor(Bezier);

export { Bezier };
