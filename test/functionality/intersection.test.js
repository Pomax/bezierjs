import { Bezier } from "../../src/bezier.js";

describe(`Intersection testing`, () => {
  test.each(["line", "ray", "segment", undefined])(
    `line(%s)/curve intersection`,
    (type) => {
      const b = new Bezier(76, 250, 77, 150, 220, 50);
      const line = { p1: { x: 13, y: 140 }, p2: { x: 213, y: 140 }, type };
      const intersections = b.intersects(line);

      expect(intersections.length).toBe(1); // curve intersects horizontal
      expect(intersections[0]).toBe(0.55); // curve intersects horizontal
    }
  );

  test(`line/curve intersection`, () => {
    const b = new Bezier(76, 250, 77, 150, 220, 50);
    const line = { p1: { x: 13, y: 140 }, p2: { x: 14, y: 140 }, type: "line" };
    const line2 = {
      p1: { x: 14, y: 140 },
      p2: { x: 13, y: 140 },
      type: "line",
    };
    const intersections = b.intersects(line);
    const intersections2 = b.intersects(line2);

    expect(intersections.length).toBe(1); // curve intersects horizontal
    expect(intersections[0]).toBe(0.55); // curve intersects horizontal
    expect(intersections2.length).toBe(1); // curve intersects horizontal
    expect(intersections2[0]).toBe(0.55); // curve intersects horizontal
  });

  test(`ray/curve intersection`, () => {
    const b = new Bezier(76, 250, 77, 150, 220, 50);
    const line = { p1: { x: 13, y: 140 }, p2: { x: 14, y: 140 }, type: "ray" };
    const line2 = { p1: { x: 14, y: 140 }, p2: { x: 13, y: 140 }, type: "ray" };
    const intersections = b.intersects(line);
    const intersections2 = b.intersects(line2);

    expect(intersections.length).toBe(1); // curve intersects horizontal
    expect(intersections[0]).toBe(0.55); // curve intersects horizontal
    expect(intersections2.length).toBe(0); // curve intersects horizontal
  });
});
