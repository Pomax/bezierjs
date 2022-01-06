import { Bezier } from "../../src/bezier.js";

describe(`Intersection testing`, () => {
  test(`line/curve intersection`, () => {
    var b = new Bezier(76, 250, 77, 150, 220, 50);
    var line = { p1: { x: 13, y: 140 }, p2: { x: 213, y: 140 } };
    var intersections = b.intersects(line);

    expect(intersections.length).toBe(1); // curve intersects horizontal
    expect(intersections[0]).toBe(0.55); // curve intersects horizontal
  });
});
