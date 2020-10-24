class CodeExample {
  constructor(idx) {
    var figure = find("figure")[idx];
    var cvs = this.cvs = document.createElement("canvas");
    cvs.width = 200;
    cvs.height = 200;
    this.ctx = cvs.getContext("2d");
    figure.appendChild(cvs);
    var button = figure.querySelector("button");
    if (button) {
      figure.appendChild(button);
    }

    this.randomColors = [];
    for (var i = 0, j; i < 360; i++) {
      j = (i * 47) % 360;
      this.randomColors.push("hsl(" + j + ",50%,50%)");
    }
    this.randomIndex = 0;
  }

  getCanvas() {
    return this.cvs;
  }

  reset(curve, evt) {
    this.cvs.width = this.cvs.width;
    this.ctx.strokeStyle = "black";
    this.ctx.fillStyle = "none";
    if (evt && curve) {
      curve.mouse = { x: evt.offsetX, y: evt.offsetY };
    }
    this.randomIndex = 0;
  }

  setColor(c) {
    this.ctx.strokeStyle = c;
  }

  noColor(c) {
    this.ctx.strokeStyle = "transparent";
  }

  setRandomColor() {
    this.randomIndex = (this.randomIndex + 1) % this.randomColors.length;
    var c = this.randomColors[this.randomIndex];
    this.ctx.strokeStyle = c;
  }

  setRandomFill(a) {
    this.randomIndex = (this.randomIndex + 1) % this.randomColors.length;
    a = typeof a === "undefined" ? 1 : a;
    var c = this.randomColors[this.randomIndex];
    c = c.replace("hsl(", "hsla(").replace(")", "," + a + ")");
    this.ctx.fillStyle = c;
  }

  setFill(c) {
    this.ctx.fillStyle = c;
  }

  noFill() {
    this.ctx.fillStyle = "transparent";
  }

  drawSkeleton(curve, offset, nocoords) {
    offset = offset || { x: 0, y: 0 };
    var pts = curve.points;
    this.ctx.strokeStyle = "lightgrey";
    this.drawLine(pts[0], pts[1], offset);
    if (pts.length === 3) {
      this.drawLine(pts[1], pts[2], offset);
    } else {
      this.drawLine(pts[2], pts[3], offset);
    }
    this.ctx.strokeStyle = "black";
    if (!nocoords) this.drawPoints(pts, offset);
  }

  drawCurve(curve, offset) {
    const ctx = this.ctx;
    offset = offset || { x: 0, y: 0 };
    var ox = offset.x;
    var oy = offset.y;
    ctx.beginPath();
    var p = curve.points,
      i;
    ctx.moveTo(p[0].x + ox, p[0].y + oy);
    if (p.length === 3) {
      ctx.quadraticCurveTo(p[1].x + ox, p[1].y + oy, p[2].x + ox, p[2].y + oy);
    }
    if (p.length === 4) {
      ctx.bezierCurveTo(
        p[1].x + ox,
        p[1].y + oy,
        p[2].x + ox,
        p[2].y + oy,
        p[3].x + ox,
        p[3].y + oy
      );
    }
    ctx.stroke();
    ctx.closePath();
  }

  drawLine(p1, p2, offset) {
    const ctx = this.ctx;
    offset = offset || { x: 0, y: 0 };
    var ox = offset.x;
    var oy = offset.y;
    ctx.beginPath();
    ctx.moveTo(p1.x + ox, p1.y + oy);
    ctx.lineTo(p2.x + ox, p2.y + oy);
    ctx.stroke();
  }

  drawPoint(p, offset) {
    const ctx = this.ctx;
    offset = offset || { x: 0, y: 0 };
    var ox = offset.x;
    var oy = offset.y;
    ctx.beginPath();
    ctx.arc(p.x + ox, p.y + oy, 5, 0, 2 * Math.PI);
    ctx.stroke();
  }

  drawPoints(points, offset) {
    offset = offset || { x: 0, y: 0 };
    points.forEach(p => this.drawCircle(p, 3, offset));
  }

  drawArc(p, offset) {
    const ctx = this.ctx;
    offset = offset || { x: 0, y: 0 };
    var ox = offset.x;
    var oy = offset.y;
    ctx.beginPath();
    ctx.moveTo(p.x + ox, p.y + oy);
    ctx.arc(p.x + ox, p.y + oy, p.r, p.s, p.e);
    ctx.lineTo(p.x + ox, p.y + oy);
    ctx.fill();
    ctx.stroke();
  }

  drawCircle(p, r, offset) {
    const ctx = this.ctx;
    offset = offset || { x: 0, y: 0 };
    var ox = offset.x;
    var oy = offset.y;
    ctx.beginPath();
    ctx.arc(p.x + ox, p.y + oy, r, 0, 2 * Math.PI);
    ctx.stroke();
  }

  drawbbox(bbox, offset) {
    const ctx = this.ctx;
    offset = offset || { x: 0, y: 0 };
    var ox = offset.x;
    var oy = offset.y;
    ctx.beginPath();
    ctx.moveTo(bbox.x.min + ox, bbox.y.min + oy);
    ctx.lineTo(bbox.x.min + ox, bbox.y.max + oy);
    ctx.lineTo(bbox.x.max + ox, bbox.y.max + oy);
    ctx.lineTo(bbox.x.max + ox, bbox.y.min + oy);
    ctx.closePath();
    ctx.stroke();
  }

  drawHull(hull, offset) {
    const ctx = this.ctx;
    ctx.beginPath();
    if (hull.length === 6) {
      ctx.moveTo(hull[0].x, hull[0].y);
      ctx.lineTo(hull[1].x, hull[1].y);
      ctx.lineTo(hull[2].x, hull[2].y);
      ctx.moveTo(hull[3].x, hull[3].y);
      ctx.lineTo(hull[4].x, hull[4].y);
    } else {
      ctx.moveTo(hull[0].x, hull[0].y);
      ctx.lineTo(hull[1].x, hull[1].y);
      ctx.lineTo(hull[2].x, hull[2].y);
      ctx.lineTo(hull[3].x, hull[3].y);
      ctx.moveTo(hull[4].x, hull[4].y);
      ctx.lineTo(hull[5].x, hull[5].y);
      ctx.lineTo(hull[6].x, hull[6].y);
      ctx.moveTo(hull[7].x, hull[7].y);
      ctx.lineTo(hull[8].x, hull[8].y);
    }
    ctx.stroke();
  }

  drawShape(shape, offset) {
    const ctx = this.ctx;
    offset = offset || { x: 0, y: 0 };
    var order = shape.forward.points.length - 1;
    ctx.beginPath();
    ctx.moveTo(
      offset.x + shape.startcap.points[0].x,
      offset.y + shape.startcap.points[0].y
    );
    ctx.lineTo(
      offset.x + shape.startcap.points[3].x,
      offset.y + shape.startcap.points[3].y
    );
    if (order === 3) {
      ctx.bezierCurveTo(
        offset.x + shape.forward.points[1].x,
        offset.y + shape.forward.points[1].y,
        offset.x + shape.forward.points[2].x,
        offset.y + shape.forward.points[2].y,
        offset.x + shape.forward.points[3].x,
        offset.y + shape.forward.points[3].y
      );
    } else {
      ctx.quadraticCurveTo(
        offset.x + shape.forward.points[1].x,
        offset.y + shape.forward.points[1].y,
        offset.x + shape.forward.points[2].x,
        offset.y + shape.forward.points[2].y
      );
    }
    ctx.lineTo(
      offset.x + shape.endcap.points[3].x,
      offset.y + shape.endcap.points[3].y
    );
    if (order === 3) {
      ctx.bezierCurveTo(
        offset.x + shape.back.points[1].x,
        offset.y + shape.back.points[1].y,
        offset.x + shape.back.points[2].x,
        offset.y + shape.back.points[2].y,
        offset.x + shape.back.points[3].x,
        offset.y + shape.back.points[3].y
      );
    } else {
      ctx.quadraticCurveTo(
        offset.x + shape.back.points[1].x,
        offset.y + shape.back.points[1].y,
        offset.x + shape.back.points[2].x,
        offset.y + shape.back.points[2].y
      );
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  drawText(text, offset) {
    offset = offset || { x: 0, y: 0 };
    this.ctx.fillText(text, offset.x, offset.y);
  }
}

export { CodeExample }
