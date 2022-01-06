import { Bezier } from "../../src/bezier.js";

describe(`outline`, () => {
  test(`offsetting a straight horizontal line should work`, () => {
    const b = new Bezier(0, 0, 2, 0, 1, 0, 3, 0);
    const outline = b.outline(10);
    const coords = outline.curves.map((b) => b.points);
    expect(coords).toEqual([
      [
        { x: 0, y: -10 },
        { x: 0, y: 0 },
        { x: 0, y: 10 },
      ],
      [
        { x: 0, y: 10 },
        { x: 1.5, y: 10 },
        { x: 3, y: 10 },
      ],
      [
        { x: 3, y: 10 },
        { x: 3, y: 0 },
        { x: 3, y: -10 },
      ],
      [
        { x: 3, y: -10 },
        { x: 1.5, y: -10 },
        { x: 0, y: -10 },
      ],
    ]);
  });

  test(`offsetting a vertical straight line should work`, () => {
    const b = new Bezier(0, 0, 0, 2, 0, 1, 0, 3);
    const outline = b.outline(10);
    const coords = outline.curves.map((b) => b.points);
    expect(coords).toEqual([
      [
        { x: 10, y: 0 },
        { x: 0, y: 0 },
        { x: -10, y: 0 },
      ],
      [
        { x: -10, y: 0 },
        { x: -10, y: 1.5 },
        { x: -10, y: 3 },
      ],
      [
        { x: -10, y: 3 },
        { x: 0, y: 3 },
        { x: 10, y: 3 },
      ],
      [
        { x: 10, y: 3 },
        { x: 10, y: 1.5 },
        { x: 10, y: 0 },
      ],
    ]);
  });

  test(`offsetting a straight line at an angle should work`, () => {
    const b = new Bezier(0, 0, 2, 2, 1, 1, 3, 3);
    const outline = b.outline(10);
    const coords = outline.curves.map((b) => b.points);
    expect(coords).toEqual([
      [
        { x: 7.0710678118654755, y: -7.0710678118654755 },
        { x: 0, y: 0 },
        { x: -7.0710678118654755, y: 7.0710678118654755 },
      ],
      [
        { x: -7.0710678118654755, y: 7.0710678118654755 },
        { x: -5.5710678118654755, y: 8.571067811865476 },
        { x: -4.0710678118654755, y: 10.071067811865476 },
      ],
      [
        { x: -4.0710678118654755, y: 10.071067811865476 },
        { x: 3, y: 3 },
        { x: 10.071067811865476, y: -4.0710678118654755 },
      ],
      [
        { x: 10.071067811865476, y: -4.0710678118654755 },
        { x: 8.571067811865476, y: -5.5710678118654755 },
        { x: 7.0710678118654755, y: -7.0710678118654755 },
      ],
    ]);
  });

  test(`graduated offsetting of a straight horizontal line should work`, () => {
    const b = new Bezier(0, 0, 2, 0, 1, 0, 3, 0);
    const outline = b.outline(10, 10, 5, 5);
    const coords = outline.curves.map((b) => b.points);
    expect(coords).toEqual([
      [
        { x: 0, y: -10 },
        { x: 0, y: 0 },
        { x: 0, y: 10 },
      ],
      [
        { x: 0, y: 10 },
        { x: 1.5, y: 7.5 },
        { x: 3, y: 5 },
      ],
      [
        { x: 3, y: 5 },
        { x: 3, y: 0 },
        { x: 3, y: -5 },
      ],
      [
        { x: 3, y: -5 },
        { x: 1.5, y: -7.5 },
        { x: 0, y: -10 },
      ],
    ]);
  });

  test(`graduated offsetting of a vertical straight line should work`, () => {
    const b = new Bezier(0, 0, 0, 2, 0, 1, 0, 3);
    const outline = b.outline(5, 5, 10, 10);
    const coords = outline.curves.map((b) => b.points);
    expect(coords).toEqual([
      [
        { x: 5, y: 0 },
        { x: 0, y: 0 },
        { x: -5, y: 0 },
      ],
      [
        { x: -5, y: 0 },
        { x: -7.5, y: 1.5 },
        { x: -10, y: 3 },
      ],
      [
        { x: -10, y: 3 },
        { x: 0, y: 3 },
        { x: 10, y: 3 },
      ],
      [
        { x: 10, y: 3 },
        { x: 7.5, y: 1.5 },
        { x: 5, y: 0 },
      ],
    ]);
  });

  test(`graduated offsetting of a straight line at an angle should work`, () => {
    const b = new Bezier(0, 0, 2, 2, 1, 1, 3, 3);
    const outline = b.outline(10, 10, 5, 5);
    const coords = outline.curves.map((b) => b.points);
    expect(coords).toEqual([
      [
        { x: 7.0710678118654755, y: -7.0710678118654755 },
        { x: 0, y: 0 },
        { x: -7.0710678118654755, y: 7.0710678118654755 },
      ],
      [
        { x: -7.0710678118654755, y: 7.0710678118654755 },
        { x: -3.8033008588991066, y: 6.803300858899107 },
        { x: -0.5355339059327378, y: 6.535533905932738 },
      ],
      [
        { x: -0.5355339059327378, y: 6.535533905932738 },
        { x: 3, y: 3 },
        { x: 6.535533905932738, y: -0.5355339059327378 },
      ],
      [
        { x: 6.535533905932738, y: -0.5355339059327378 },
        { x: 6.803300858899107, y: -3.8033008588991066 },
        { x: 7.0710678118654755, y: -7.0710678118654755 },
      ],
    ]);
  });
});
