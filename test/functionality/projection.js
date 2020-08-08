import { Bezier } from "../../lib/bezier.js";
import chai from "chai";
import chaiStats from "chai-stats";
const assert = chai.use(chaiStats).assert;

describe(`projections onto curves`, () => {
  it(`projects onto the correct on-curve point`, () => {
    var b = new Bezier([0, 0, 100, 0, 100, 100]);
    var projection = b.project({ x: 80, y: 20 });
    assert.equal(projection.x, 75);
    assert.equal(projection.y, 25);
  });
});
