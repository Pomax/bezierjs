class Draw {

  constructor(cvs, lg){
    console.log(cvs)
    this.canvas = cvs
    this.ctx = cvs.getContext("2d");  
    this.utility = Bezier.getUtils();
  }

  getCanvas() { return cvs; }


  draw(lg){
    this.ctx.clearRect(0, 0, cvs.width, cvs.height);
    this.setFill('white');
    this.drawSkeleton(lg);
    this.drawCurve(lg);
  }

  reset(curve, evt) {
      cvs.width = cvs.width;
      this.ctx.strokeStyle = "black";
      this.ctx.fillStyle = "none";
      if (evt && curve) {
        curve.mouse = {x: evt.offsetX, y: evt.offsetY};
      }
      randomIndex = 0;
    }

  setColor(c) {
      this.ctx.strokeStyle = c;
    }

  noColor(c) {
      this.ctx.strokeStyle = "transparent";
    }

  setFill(c) {
      this.ctx.fillStyle = c;
    }

  noFill() {
      this.ctx.fillStyle = "transparent";
    }

  drawSkeleton(lg, offset, nocoords) {
      for(var curve of lg.curves){
        offset = offset || { x:0, y:0 };
        var pts = curve.points;
        this.ctx.strokeStyle = "lightgrey";
        this.drawLine(pts[0], pts[1], offset);
        if(pts.length === 3) { this.drawLine(pts[1], pts[2], offset); }
        else {this.drawLine(pts[2], pts[3], offset); }
        this.ctx.strokeStyle = "black";
        if(!nocoords) this.drawPoints(pts, offset);
      }
    }

  drawCurve(lg, offset) {
    for(var curve of lg.curves) {
      offset = offset || { x:0, y:0 };
      var ox = offset.x;
      var oy = offset.y;
      this.ctx.beginPath();
      var p = curve.points, i;
      this.ctx.moveTo(p[0].x + ox, p[0].y + oy);
      if(p.length === 3) {
        this.ctx.quadraticCurveTo(
          p[1].x + ox, p[1].y + oy,
          p[2].x + ox, p[2].y + oy
        );
      }
      if(p.length === 4) {
        this.ctx.bezierCurveTo(
          p[1].x + ox, p[1].y + oy,
          p[2].x + ox, p[2].y + oy,
          p[3].x + ox, p[3].y + oy
        );
      }
      this.ctx.stroke();
      this.ctx.closePath();
      }
    }

  drawLine(p1, p2, offset) {
      offset = offset || { x:0, y:0 };
      var ox = offset.x;
      var oy = offset.y;
      this.ctx.beginPath();
      this.ctx.moveTo(p1.x + ox,p1.y + oy);
      this.ctx.lineTo(p2.x + ox,p2.y + oy);
      this.ctx.stroke();
    }

  drawPoint(p, offset) {
      console.log((new Error()).stack)
      offset = offset || { x:0, y:0 };
      var ox = offset.x;
      var oy = offset.y;
      this.ctx.beginPath();
      this.ctx.arc(p.x + ox, p.y + oy, 5, 0, 2*Math.PI);
      this.ctx.stroke();
    }

  drawPoints(points, offset) {
      offset = offset || { x:0, y:0 };
      for(var p of points){
          this.drawCircle(p, 3, offset);
      }
    }

  drawArc(p, offset) {
      offset = offset || { x:0, y:0 };
      var ox = offset.x;
      var oy = offset.y;
      this.ctx.beginPath();
      this.ctx.moveTo(p.x + ox, p.y + oy);
      this.ctx.arc(p.x + ox, p.y + oy, p.r, p.s, p.e);
      this.ctx.lineTo(p.x + ox, p.y + oy);
      this.ctx.fill();
      this.ctx.stroke();
    }

  drawCircle(p, r, offset) {
      offset = offset || { x:0, y:0 };
      var ox = offset.x;
      var oy = offset.y;
      this.ctx.beginPath();
      this.ctx.arc(p.x + ox, p.y + oy, r, 0, 2*Math.PI);
      this.ctx.stroke();
    }

  drawbbox(bbox, offset) {
      offset = offset || { x:0, y:0 };
      var ox = offset.x;
      var oy = offset.y;
      this.ctx.beginPath();
      this.ctx.moveTo(bbox.x.min + ox, bbox.y.min + oy);
      this.ctx.lineTo(bbox.x.min + ox, bbox.y.max + oy);
      this.ctx.lineTo(bbox.x.max + ox, bbox.y.max + oy);
      this.ctx.lineTo(bbox.x.max + ox, bbox.y.min + oy);
      this.ctx.closePath();
      this.ctx.stroke();
    }

  drawHull(hull, offset) {
      this.ctx.beginPath();
      if(hull.length === 6) {
        this.ctx.moveTo(hull[0].x, hull[0].y);
        this.ctx.lineTo(hull[1].x, hull[1].y);
        this.ctx.lineTo(hull[2].x, hull[2].y);
        this.ctx.moveTo(hull[3].x, hull[3].y);
        this.ctx.lineTo(hull[4].x, hull[4].y);
      } else {
        this.ctx.moveTo(hull[0].x, hull[0].y);
        this.ctx.lineTo(hull[1].x, hull[1].y);
        this.ctx.lineTo(hull[2].x, hull[2].y);
        this.ctx.lineTo(hull[3].x, hull[3].y);
        this.ctx.moveTo(hull[4].x, hull[4].y);
        this.ctx.lineTo(hull[5].x, hull[5].y);
        this.ctx.lineTo(hull[6].x, hull[6].y);
        this.ctx.moveTo(hull[7].x, hull[7].y);
        this.ctx.lineTo(hull[8].x, hull[8].y);
      }
      this.ctx.stroke();
    }

  drawShape(shape, offset) {
      offset = offset || { x:0, y:0 };
      var order = shape.forward.points.length - 1;
      this.ctx.beginPath();
      this.ctx.moveTo(offset.x + shape.startcap.points[0].x, offset.y + shape.startcap.points[0].y);
      this.ctx.lineTo(offset.x + shape.startcap.points[3].x, offset.y + shape.startcap.points[3].y);
      if(order === 3) {
        this.ctx.bezierCurveTo(
          offset.x + shape.forward.points[1].x, offset.y + shape.forward.points[1].y,
          offset.x + shape.forward.points[2].x, offset.y + shape.forward.points[2].y,
          offset.x + shape.forward.points[3].x, offset.y + shape.forward.points[3].y
        );
      } else {
        this.ctx.quadraticCurveTo(
          offset.x + shape.forward.points[1].x, offset.y + shape.forward.points[1].y,
          offset.x + shape.forward.points[2].x, offset.y + shape.forward.points[2].y
        );
      }
      this.ctx.lineTo(offset.x + shape.endcap.points[3].x, offset.y + shape.endcap.points[3].y);
      if(order === 3) {
        this.ctx.bezierCurveTo(
          offset.x + shape.back.points[1].x, offset.y + shape.back.points[1].y,
          offset.x + shape.back.points[2].x, offset.y + shape.back.points[2].y,
          offset.x + shape.back.points[3].x, offset.y + shape.back.points[3].y
        );
      } else {
        this.ctx.quadraticCurveTo(
          offset.x + shape.back.points[1].x, offset.y + shape.back.points[1].y,
          offset.x + shape.back.points[2].x, offset.y + shape.back.points[2].y
        );
      }
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();
    }

  drawText(text, offset) {
      offset = offset || { x:0, y:0 };
      this.ctx.fillText(text, offset.x, offset.y);
    }
}
