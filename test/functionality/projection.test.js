import { Bezier } from "../../src/bezier.js";

describe(`projections onto curves`, () => {
  test(`projects onto the correct on-curve point`, () => {
    var b = new Bezier([0, 0, 100, 0, 100, 100]);
    var projection = b.project({ x: 80, y: 20 });
    expect(projection).toEqual({
      x: 75,
      y: 25,
      t: 0.5,
      d: 7.0710678118654755,
    });
  });
});
