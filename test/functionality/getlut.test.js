import { Bezier } from "../../src/bezier.js";

describe(`getLut`, () => {
  test(`getLUT(n) yields n+1 points`, () => {
    const b = new Bezier(0, 0, 0, 1, 1, 1, 1, 0);
    const lut = b.getLUT(100);
    expect(lut.length).toBe(101);
  });
});
