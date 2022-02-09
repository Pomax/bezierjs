import { HigherOrder } from "./higher-order.js";
import { utils } from "../utils.js";

const { atan2 } = Math;

export class Line2D extends HigherOrder {
  computedirection() {
    const [p1, p2] = this.points;
    const angle = atan2(p2.y - p1.y, p2.x - p1.x);
    this.clockwise = angle > 0;
  }

  toSVG() {
    const [p1, p2] = this.points;
    return [`M`, p1.x, p1.y, `L`, p2.x, p2.y].join(` `);
  }

  length() {
    const [p1, p2] = this.points;
    return utils.dist(p1, p2);
  }

  raise() {
    const [p1, p2] = this.points;
    const p3 = this.get(0.5);
    return new this.Bezier([p1, p2, p3]);
  }

  get(t) {
    const [p1, p2] = this.points;
    const p = utils.lerp(t, p1, p2);
    p.t = t;
    return p;
  }

  on(point, error) {
    // point projection check
  }

  curvature(t) {
    return 0;
  }

  inflections() {
    return [];
  }

  scale(d) {
    let distanceFn = false;
    if (typeof d === "function") {
      distanceFn = d;
    }

    return this.translate(
      this.normal(0),
      distanceFn ? distanceFn(0) : d,
      distanceFn ? distanceFn(1) : d
    );
  }

  outline(d1, d2, d3, d4) {
    d2 = d2 === undefined ? d1 : d2;

    // TODO: find the actual extrema, because they might
    //       be before the start, or past the end.

    const n = this.normal(0);
    const start = this.points[0];
    const end = this.points[this.points.length - 1];
    let s, mid, e;

    if (d3 === undefined) {
      d3 = d1;
      d4 = d2;
    }

    s = { x: start.x + n.x * d1, y: start.y + n.y * d1 };
    e = { x: end.x + n.x * d3, y: end.y + n.y * d3 };
    mid = { x: (s.x + e.x) / 2, y: (s.y + e.y) / 2 };
    const fline = [s, mid, e];

    s = { x: start.x - n.x * d2, y: start.y - n.y * d2 };
    e = { x: end.x - n.x * d4, y: end.y - n.y * d4 };
    mid = { x: (s.x + e.x) / 2, y: (s.y + e.y) / 2 };
    const bline = [e, mid, s];

    const ls = utils.makeline(bline[2], fline[0]);
    const le = utils.makeline(fline[2], bline[0]);
    const segments = [ls, new Bezier(fline), le, new Bezier(bline)];
    return new PolyBezier(segments);
  }

  arcs() {
    throw new Error(`Cannot approximate a line with an arc`);
  }
}
