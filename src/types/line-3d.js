import { Line2D } from "./line-2d.js";

export class Line3D extends Line2D {
  toSVG() {
    throw new Error(`SVG does not support 3D curves`);
  }
}
