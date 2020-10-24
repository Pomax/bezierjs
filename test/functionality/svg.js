import { Bezier } from "../../lib/bezier.js";
import chai from "chai";
import chaiStats from "chai-stats";
const assert = chai.use(chaiStats).assert;

describe(`SVG conversion`, () => {
  describe(`from simple path`, () => {
    it(`should form a 2-curve poly-bezier`, () => {
      const circle =
        "M138.406787,51.9034859 C138.406787,51.9034859 74.8695308,-25.4868408 21.9358155,9.81888414 C-30.9978998,45.1246091 32.5393566,122.514936 32.5393566,122.514936";
      const circleSegments = Bezier.SVGtoBeziers(circle);
      assert.equal(circleSegments.curves.length, 2);
    });
  });

  describe(`from longer path`, () => {
    it(`should form a 4-curve poly-bezier`, () => {
      const path =
        "M133.38,286.76 C59.7162601,286.76 0,227.04374 0,153.38 C0,79.7162601 59.7162601,20 133.38,20 C207.04374,20 266.76,79.7162601 266.76,153.38 C266.76,227.04374 207.04374,286.76 133.38,286.76 Z";
      const pathSegments = Bezier.SVGtoBeziers(path);
      assert.equal(pathSegments.curves.length, 4);
    });
  });
});
