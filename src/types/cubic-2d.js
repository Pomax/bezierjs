import { HigherOrder } from "./higher-order.js";
import { utils } from "../utils.js";

export class Cubic2D extends HigherOrder {
  toSVG() {
    const [p1, p2, p3, p4] = this.points;
    return [`M`, p1.x, p1.y, `C`, p2.x, p2.y, p3.x, p3.y, p4.x, p4.y].join(` `);
  }

  get(t) {
    const [p1, p2, p3, p4] = this.points;
    const p5 = utils.lerp(t, p1, p2);
    const p6 = utils.lerp(t, p2, p3);
    const p7 = utils.lerp(t, p3, p4);
    const p8 = utils.lerp(t, p5, p6);
    const p9 = utils.lerp(t, p6, p7);
    const p10 = utils.lerp(t, p8, p9);
    p10.t = t;
    return p10;
  }
}
