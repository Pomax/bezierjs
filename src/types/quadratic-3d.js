import { Quadratic2D } from "./quadratic-2d.js";

export class Quadratic3D extends Quadratic2D {
  toSVG() {
    throw new Error(`SVG does not support 3D curves`);
  }
}
