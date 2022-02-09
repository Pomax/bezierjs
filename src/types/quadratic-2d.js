import { HigherOrder } from "./higher-order.js";
import { utils } from "../utils.js";

export class Quadratic2D extends HigherOrder {
  toSVG() {
    const [p1, p2, p3] = this.points;
    return [`M`, p1.x, p1.y, `Q`, p2.x, p2.y, p3.x, p3.y].join(` `);
  }

  get(t) {
    const [p1, p2, p3] = this.points;
    const p4 = utils.lerp(t, p1, p2);
    const p5 = utils.lerp(t, p2, p3);
    const p6 = utils.lerp(t, p4, p5);
    p6.t = t;
    return p6;
  }

  on(point, error) {
    // point projection check
  }

  inflections() {
    return [];
  }
}
