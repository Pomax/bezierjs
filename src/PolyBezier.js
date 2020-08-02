import utils from './utils';

/**
 * {@code PolyBezier} is a spline composed of {@link Bezier} curves.
 */
export class PolyBezier {
  /**
   * Poly Bezier
   * @param {Bezier[]}[curves]
   */
  constructor (curves) {
    this.curves = [];
    this._3d = false;

    if (curves) {
      this.curves = curves;
      this._3d = this.curves[0]._3d;
    }
  }

  valueOf () {
    return this.toString();
  }

  toString () {
    return (
      '[' +
      this.curves
        .map(function (curve) {
          return utils.pointsToString(curve.points);
        })
        .join(', ') +
      ']'
    );
  }

  /**
   * @param {Bezier} curve
   */
  addCurve (curve) {
    this.curves.push(curve);
    this._3d = this._3d || curve._3d;
  }

  /**
   * @returns {number} the sum of the arc lengths of each subcurve
   */
  length () {
    return this.curves
      .map(function (v) {
        return v.length();
      })
      .reduce(function (a, b) {
        return a + b;
      });
  }

  curve (idx) {
    return this.curves[idx];
  }

  bbox () {
    var c = this.curves;
    var bbox = c[0].bbox();
    for (var i = 1; i < c.length; i++) {
      utils.expandbox(bbox, c[i].bbox());
    }
    return bbox;
  }

  offset (d) {
    let offset = [];

    this.curves.forEach(function (v) {
      offset = offset.concat(v.offset(d));
    });

    return new PolyBezier(offset);
  }
}
