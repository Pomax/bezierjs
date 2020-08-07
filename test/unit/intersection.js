import { Bezier } from "../../lib/bezier.js";
import chai from "chai";
import chaiStats from "chai-stats";
const assert = chai.use(chaiStats).assert;

// test higher order curves, at least for what can be called.
describe(`Intersection testing`, () => {
  describe(`line/curve intersection`, () => {
    const b = new Bezier([0, 1.74, 0.21, 1.67, 0.28, 1.32, 0.28, 0.86]);
    const line = {
      p1: { x: -0.56, y: 0.95 },
      p2: { x: 0.57, y: 0.95 },
    };

    it(`has intersection points`, () => {
      assert.notEqual(b.intersects(line).length, 0);
    });
  });
});
