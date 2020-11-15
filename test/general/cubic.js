import { Bezier } from "../../lib/bezier.js";
const utils = Bezier.getUtils();

import chai from "chai";
import chaiStats from "chai-stats";
const assert = chai.use(chaiStats).assert;

describe(`Cubic bezier`, () => {
  const run = (b) => {
    it(`serializes correctly`, () => {
      assert.equal(b.toString(), "[0/0, 0/1, 1/1, 1/0]");
    });

    it(`has the correct approximate length`, () => {
      assert.almostEqual(b.length(), 2);
    });

    it(`has the expected derivative points`, () => {
      assert.deepAlmostEqual(b.dpoints, [
        [
          { x: 0, y: 3 },
          { x: 3, y: 0 },
          { x: 0, y: -3 },
        ],
        [
          { x: 6, y: -6 },
          { x: -6, y: -6 },
        ],
        [{ x: -12, y: 0 }],
      ]);
      assert.deepAlmostEqual(b.derivative(0), { t: 0, x: 0, y: 3 });
      assert.deepAlmostEqual(b.derivative(0.5), { t: 0.5, x: 1.5, y: 0 });
      assert.deepAlmostEqual(b.derivative(1), { t: 1, x: 0, y: -3 });
    });

    it(`has the expected normals`, () => {
      assert.deepAlmostEqual(b.normal(0), { t: 0, x: -1, y: 0 });
      assert.deepAlmostEqual(b.normal(0.5), { t: 0.5, x: -0, y: 1 });
      assert.deepAlmostEqual(b.normal(1), { t: 1, x: 1, y: 0 });
    });

    it(`has the correct inflection point`, () => {
      assert.deepAlmostEqual(b.inflections(), {
        x: [0, 0.5, 1],
        y: [0.5],
        values: [0, 0.5, 0.5, 1],
      });
    });

    it(`has the correct axis-aligned bounding box`, () => {
      assert.deepAlmostEqual(b.bbox(), {
        x: { min: 0, mid: 0.5, max: 1, size: 1 },
        y: { min: 0, mid: 0.375, max: 0.75, size: 0.75 },
      });
    });
  };

  describe(`from constructor`, () => {
    const b = new Bezier(0, 0, 0, 1, 1, 1, 1, 0);
    run(b);
  });

  describe(`from point set`, () => {
    const M = { x: 200 / 3, y: 100 / 3 };
    const pts = [{ x: 0, y: 0 }, M, { x: 100, y: 100 }];

    it(`has the correct midpoint using default t value`, () => {
      const b = Bezier.cubicFromPoints(pts[0], pts[1], pts[2]);
      const midpoint = b.get(0.5);
      assert.deepAlmostEqual(M, midpoint);
    });

    it(`has the correct t=0.25 point using t=0.25 as reference`, () => {
      const t = 0.25;
      const b = Bezier.cubicFromPoints(pts[0], pts[1], pts[2], t);
      const quarterpoint = b.get(t);
      assert.deepAlmostEqual(M, quarterpoint);
    });
  });
});
