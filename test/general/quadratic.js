import { Bezier } from "../../lib/bezier.js";
const utils = Bezier.getUtils();

import chai from "chai";
import chaiStats from "chai-stats";
const assert = chai.use(chaiStats).assert;

describe(`Quadratic bezier`, () => {
  const run = (b) => {
    it(`serializes correctly`, () => {
      assert.equal(b.toString(), "[0/0, 0.5/1, 1/0]");
    });

    it(`has the correct approximate length`, () => {
      assert.almostEqual(b.length(), 1.4789428575453212);
    });

    it(`has the expected derivative points`, () => {
      assert.deepAlmostEqual(b.dpoints, [
        [
          { x: 1, y: 2 },
          { x: 1, y: -2 },
        ],
        [{ x: 0, y: -4 }],
      ]);
      assert.deepAlmostEqual(b.derivative(0), { x: 1, y: 2 });
      assert.deepAlmostEqual(b.derivative(0.5), { x: 1, y: 0 });
      assert.deepAlmostEqual(b.derivative(1), { x: 1, y: -2 });
    });

    it(`has the expected normals`, () => {
      assert.deepAlmostEqual(b.normal(0), {
        x: -0.8944271909999159,
        y: 0.4472135954999579,
      });
      assert.deepAlmostEqual(b.normal(0.5), { x: -0, y: 1 });
      assert.deepAlmostEqual(b.normal(1), {
        x: 0.8944271909999159,
        y: 0.4472135954999579,
      });
    });

    it(`has the correct inflection point`, () => {
      assert.deepAlmostEqual(b.inflections(), {
        x: [],
        y: [0.5],
        values: [0.5],
      });
    });

    it(`has the correct axis-aligned bounding box`, () => {
      assert.deepAlmostEqual(b.bbox(), {
        x: { min: 0, mid: 0.5, max: 1, size: 1 },
        y: { min: 0, mid: 0.25, max: 0.5, size: 0.5 },
      });
    });
  };

  describe(`from constructor`, () => {
    const b = new Bezier(0, 0, 0.5, 1, 1, 0);
    run(b);
  });

  describe(`from SVG builder`, () => {
    const b = Bezier.SVGtoBeziers("M 0 0 Q 0.5 1 1 0").curve(0);
    run(b);
  });

  describe(`from point set`, () => {
    const M = { x: 75, y: 25 };
    const pts = [{ x: 0, y: 0 }, M, { x: 100, y: 100 }];

    it(`has the correct midpoint using default t value`, () => {
      const b = Bezier.quadraticFromPoints(pts[0], pts[1], pts[2]);
      const midpoint = b.get(0.5);

      assert.isTrue(utils.approximately(M.x, midpoint.x));
      assert.isTrue(utils.approximately(M.y, midpoint.y));
    });

    it(`has the correct t=0.25 point using t=0.25 as reference`, () => {
      const t = 0.25;
      const b = Bezier.quadraticFromPoints(pts[0], pts[1], pts[2], t);
      const quarterpoint = b.get(t);
      assert.isTrue(utils.approximately(M.x, quarterpoint.x));
      assert.isTrue(utils.approximately(M.y, quarterpoint.y));
    });
  });
});
