import { Bezier } from "../../src/bezier.js";
import chai from "chai";
import chaiStats from "chai-stats";
const assert = chai.use(chaiStats).assert;

// test higher order curves, at least for what can be called.
describe(`Intersection testing`, () => {
  describe(`line/curve intersection`, () => {
    var b = new Bezier(76, 250, 77, 150, 220, 50);
    var line = { p1: { x: 13, y: 140 }, p2: { x: 213, y: 140 } };
    var intersections = b.intersects(line);

    it(`has the correct intersection`, () => {
      assert(intersections.length === 1, "curve intersects horizontal");
      assert(intersections[0] === 0.55, "curve intersects horizontal");
    });
  });
});
