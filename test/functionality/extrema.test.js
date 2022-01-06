import { Bezier } from "../../src/bezier.js";

describe(`Extrema`, () => {
  const B = new Bezier(330, 592, 330, 557, 315, 522, 315, 485);
  const e = B.extrema().values;

  test(`has correct extrema`, () => {
    expect(e.length).toBe(3); // Extrema test curve has three extrema
    expect(Math.abs(e[0])).toBe(0); // Extrema test curve value 1 is zero, but see https://github.com/facebook/jest/issues/12221
    expect(e[1]).toBe(0.5); // Extrema test curve value 2 is one half
    expect(e[2]).toBe(1); // Extrema test curve value 3 is one
  });
});
