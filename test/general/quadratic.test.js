import { Bezier } from "../../src/bezier.js";

describe(`Quadratic bezier`, () => {
  describe(`from constructor`, () => {
    const b = new Bezier(0, 0, 0.5, 1, 1, 0);

    test(`serializes correctly`, () => {
      expect(b.toString()).toBe("[0/0, 0.5/1, 1/0]");
    });

    test(`has the correct approximate length`, () => {
      expect(b.length()).toBe(1.4789428575453212);
    });

    // fucking jest bug
    test(`has the expected derivative points`, () => {
      expect(b.dpoints).toEqual([
        [
          { x: 1, y: 2 },
          { x: 1, y: -2 },
        ],
        [{ x: 0, y: -4 }],
      ]);
      expect(b.derivative(0)).toEqual({ t: 0, x: 1, y: 2 });
      expect(b.derivative(0.5)).toEqual({ t: 0.5, x: 1, y: 0 });
      expect(b.derivative(1)).toEqual({ t: 1, x: 1, y: -2 });
    });

    test(`has the expected normals`, () => {
      expect(b.normal(0)).toEqual({
        t: 0,
        x: -0.8944271909999159,
        y: 0.4472135954999579,
      });
      expect(b.normal(0.5)).toEqual({ t: 0.5, x: -0, y: 1 });
      expect(b.normal(1)).toEqual({
        t: 1,
        x: 0.8944271909999159,
        y: 0.4472135954999579,
      });
    });

    test(`has the correct inflection point`, () => {
      // quadratic curves by definition have no inflections
      expect(b.inflections()).toEqual([]);
    });

    test(`has the correct axis-aligned bounding box`, () => {
      expect(b.bbox()).toEqual({
        x: { min: 0, mid: 0.5, max: 1, size: 1 },
        y: { min: 0, mid: 0.25, max: 0.5, size: 0.5 },
      });
    });
  });

  describe(`from point set`, () => {
    const M = { x: 75, y: 25 };
    const pts = [{ x: 0, y: 0 }, M, { x: 100, y: 100 }];

    test(`has the correct midpoint using default t value`, () => {
      const b = Bezier.quadraticFromPoints(pts[0], pts[1], pts[2]);
      const midpoint = b.get(0.5);
      expect(midpoint).toEqual({ t: 0.5, ...M });
    });

    test(`has the correct t=0.25 point using t=0.25 as reference`, () => {
      const t = 0.25;
      const b = Bezier.quadraticFromPoints(pts[0], pts[1], pts[2], t);
      const quarterpoint = b.get(t);
      expect(quarterpoint).toEqual({ t: 0.25, ...M });
    });
  });
});
