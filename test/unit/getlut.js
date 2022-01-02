import { Bezier } from "../../src/bezier.js";
const utils = Bezier.getUtils();

import chai from "chai";
import chaiStats from "chai-stats";
const assert = chai.use(chaiStats).assert;

describe(`getLut`, () => {
  it(`getLUT(n) yields n+1 points`, () => {
    const b = new Bezier(0, 0, 0, 1, 1, 1, 1, 0);
    const lut = b.getLUT(100);
    assert.equal(lut.length, 101);
  });
});
