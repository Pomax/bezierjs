import { utils } from "./utils.js";

/**
 * Poly Bezier
 * @param {[type]} curves [description]
 */
class PolyBezier {
  constructor(curves = []) {
    this.curves = [];
    this.curves = curves;
    this._3d = this.curves[0]?._3d ?? false;
  }

  valueOf() {
    return this.toString();
  }

  toString() {
    return "[" + this.curves.map((curve) => curve.toString()).join(", ") + "]";
  }

  addCurve(curve) {
    this.curves.push(curve);
    this._3d = this._3d || curve._3d; // TODO: this needs a test to make sure things don't break when mixing 2d/3d
  }

  length() {
    return this.curves.map((v) => v.length()).reduce((a, b) => a + b, 0);
  }

  curve(idx) {
    return this.curves[idx];
  }

  bbox() {
    const c = this.curves;
    var bbox = c[0].bbox();
    for (var i = 1; i < c.length; i++) {
      utils.expandbox(bbox, c[i].bbox());
    }
    return bbox;
  }

  offset(d) {
    return new PolyBezier(this.curves.map((v) => v.offset(d)).flat());
  }
}

export { PolyBezier };
