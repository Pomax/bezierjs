import { Bezier } from "../../src/bezier.js";

describe(`split curves`, () => {
  test(`split errors when a == b`, () => {
    const b = new Bezier(0, 0, 0, 1, 1, 1, 1, 0);

    expect(() => {
      b.split(0.1, 0.1);
    }).toThrow();
  });
});
