"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PolyBezier = void 0;

var _utils = require("./utils.js");

/**
 * Poly Bezier
 * @param {[type]} curves [description]
 */
class PolyBezier {
  constructor(curves) {
    this.curves = [];
    this._3d = false;

    if (!!curves) {
      this.curves = curves;
      this._3d = this.curves[0]._3d;
    }
  }

  valueOf() {
    return this.toString();
  }

  toString() {
    return "[" + this.curves.map(function (curve) {
      return _utils.utils.pointsToString(curve.points);
    }).join(", ") + "]";
  }

  addCurve(curve) {
    this.curves.push(curve);
    this._3d = this._3d || curve._3d;
  }

  length() {
    return this.curves.map(function (v) {
      return v.length();
    }).reduce(function (a, b) {
      return a + b;
    });
  }

  curve(idx) {
    return this.curves[idx];
  }

  bbox() {
    const c = this.curves;
    var bbox = c[0].bbox();

    for (var i = 1; i < c.length; i++) {
      _utils.utils.expandbox(bbox, c[i].bbox());
    }

    return bbox;
  }

  offset(d) {
    const offset = [];
    this.curves.forEach(function (v) {
      offset.push(...v.offset(d));
    });
    return new PolyBezier(offset);
  }

}

exports.PolyBezier = PolyBezier;