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

describe("Bezier curve getAtDistance method", () => {
  test("returns correct point for a straight line", () => {
    const curve = new Bezier(
      new Point(0, 0),
      new Point(5, 5),
      new Point(10, 10)
    );
    const point = curve.getAtDistance(Math.sqrt(50)); // distance of sqrt(50) should take us to (5,5)

    expect(point.x).toBeCloseTo(5);
    expect(point.y).toBeCloseTo(5);
    expect(point.t).toBeCloseTo(0.5); // halfway along the curve
  });

  test("returns undefined for distance larger than curve length", () => {
    const curve = new Bezier(new Point(0, 0), new Point(10, 10));
    const point = curve.getAtDistance(200); // distance is larger than curve length

    expect(point).toBeUndefined();
  });

  test("returns correct point for cubic Bezier curve", () => {
    const curve = new Bezier(
      new Point(0, 0),
      new Point(0, 10),
      new Point(10, 10),
      new Point(10, 0)
    );
    const point = curve.getAtDistance(10);
    expect(point.x).toBeCloseTo(5);
    expect(point.y).toBeCloseTo(7.5);
    expect(point.t).toBeCloseTo(0.5);
  });

  test("throws an error when negative distance is provided", () => {
    const curve = new Bezier(new Point(0, 0), new Point(10, 10));
    const point = curve.getAtDistance(-10);
    expect(point).toBeUndefined();
  });
});
