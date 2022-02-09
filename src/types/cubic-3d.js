import { Cubic2D } from "./cubic-2d.js";

export class Cubic3D extends Cubic2D {
  toSVG() {
    throw new Error(`SVG does not support 3D curves`);
  }
}
