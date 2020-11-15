// test for numerical precision despite rounding errors after the significant digit

import { utils } from "../../src/utils.js";
import chai from "chai";
import chaiStats from "chai-stats";
const assert = chai.use(chaiStats).assert;

describe(`test numerical precision`, () => {
  it(`yields number in expected range`, () => {
    var p = [
        { x: 0, y: 1.74 },
        { x: 0.21, y: 1.67 },
        { x: 0.28, y: 1.32 },
        { x: 0.28, y: 0.86 },
      ],
      t = 0.9336954111478684,
      mt = 1 - t,
      mt2 = mt * mt,
      t2 = t * t,
      a = mt2 * mt,
      b = mt2 * t * 3,
      c = mt * t2 * 3,
      d = t * t2,
      np = {
        x: a * p[0].x + b * p[1].x + c * p[2].x + d * p[3].x,
        y: a * p[0].y + b * p[1].y + c * p[2].y + d * p[3].y,
      },
      my = 0.95,
      MY = 0.95;

    assert(
      utils.between(np.y, my, MY) === true,
      "y inside range, despite IEEE rounding"
    );
  });
});
