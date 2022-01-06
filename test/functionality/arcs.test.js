import { Bezier } from "../../src/bezier.js";

describe(`Arc approximation`, () => {
  test(`arc gets capped at 1.0`, () => {
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

    expect(arc.interval.end).toBe(1);
  });
});
