import { Bezier } from "../../src/bezier.js";
import chai from "chai";
import chaiStats from "chai-stats";
const assert = chai.use(chaiStats).assert;

describe(`Extrema`, () => {
  const B = new Bezier(330, 592, 330, 557, 315, 522, 315, 485);
  const e = B.extrema().values;

  it(`has correct extrema`, () => {
    assert.equal(e.length, 3, "Extrema test curve has three extrema");
    assert.equal(e[0], 0, "Extrema test curve value 1 is zero");
    assert.equal(e[1], 0.5, "Extrema test curve value 2 is one half");
    assert.equal(e[2], 1, "Extrema test curve value 3 is one");
  });
});
