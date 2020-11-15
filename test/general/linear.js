import { Bezier } from "../../src/bezier.js";
import chai from "chai";
import chaiStats from "chai-stats";
const assert = chai.use(chaiStats).assert;

describe(`"linear" curves`, () => {
  const b = new Bezier([0, 0, 100, 100]);

  it(`serializes correctly`, () => {
    assert.equal(b.toString(), "[0/0, 100/100]");
  });

  it(`midpoint is, indeed, the midpoint`, () => {
    const t5 = b.compute(0.5);
    assert.equal(t5.x, 50);
    assert.equal(t5.y, 50);
  });
});
