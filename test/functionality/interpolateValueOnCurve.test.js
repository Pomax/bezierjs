import { Bezier } from "../../src/bezier.js";

class Point {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    if (z) {
      this.z = z;
    }
  }
}

const p0 = new Point(0, 0);
const p1 = new Point(0, 10);
const p2 = new Point(10, 10);
const p3 = new Point(10, 0);

describe("Bezier curve interpolateOnCurveByT method", () => {
  test("returns v0 when t is 0", () => {
    let curve = new Bezier(p0, p1, p2, p3);
    let result = curve.interpolateOnCurveByT(5, 10, 0);

    expect(result).toBeCloseTo(5);
  });

  test("returns v1 when t is 1", () => {
    let curve = new Bezier(p0, p1, p2, p3);
    let result = curve.interpolateOnCurveByT(5, 10, 1);

    expect(result).toBeCloseTo(10);
  });

  test("returns interpolated value for t in between 0 and 1", () => {
    let curve = new Bezier(p0, p1, p2, p3);
    let result = curve.interpolateOnCurveByT(5, 10, 0.5);
    expect(result).toBeCloseTo(7.5);

    // The expected value depends on the actual length of the curve. Adjust this value based on your specific curve
    // For instance, if the length of the curve is equal to the length of the straight line between the points,
    // the expected value would be 7.5.
  });

  test("returns v0 when t is less than 0", () => {
    let curve = new Bezier(p0, p1, p2, p3);
    let result = curve.interpolateOnCurveByT(5, 10, -0.5);

    expect(result).toBeCloseTo(5);
  });

  test("returns v1 when t is more than 1", () => {
    let curve = new Bezier(p0, p1, p2, p3);
    let result = curve.interpolateOnCurveByT(5, 10, 1.5);

    expect(result).toBeCloseTo(10);
  });
});
