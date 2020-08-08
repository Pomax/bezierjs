import { Bezier } from "../../lib/bezier.js";
import chai from "chai";
import chaiStats from "chai-stats";
const assert = chai.use(chaiStats).assert;

describe(`Arc approximation`, () => {
  const b = new Bezier([
    25.308000000000003,
    10.260000000000001,
    25.848000000000002,
    10.728000000000001,
    25.848000000000002,
    11.304000000000002,
  ]);
  const arcs = b.arcs(0.0012143080752705958);
  const arc = arcs[1];

  it(`arc gets capped at t=1.0`, () => {
    assert.equal(arc.interval.end, 1);
  });
});
