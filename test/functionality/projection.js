import { Bezier } from "../../src/bezier.js";
import chai from "chai";
import chaiStats from "chai-stats";
const assert = chai.use(chaiStats).assert;

describe(`projections onto curves`, () => {
  it(`projects onto the correct on-curve point`, () => {
    var b = new Bezier([0, 0, 100, 0, 100, 100]);
    var projection = b.project({ x: 80, y: 20 });
    console.log(projection);
    assert.deepAlmostEqual(projection, {
      x: 75,
      y: 25,
      t: 0.5,
      d: 7.071067811865473,
    });
  });
});
