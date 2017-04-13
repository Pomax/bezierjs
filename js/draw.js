function bindDrawFunctions(cvs) {

  this.ctx = cvs.getContext("2d");
  // var button = figure.querySelector("button");
  // if(button) { figure.appendChild(button); }

  var randomColors = [];
  for(var i=0,j; i<360; i++) {
    j = (i*47)%360;
    randomColors.push("hsl("+j+",50%,50%)");
  }
  var randomIndex = 0;


  return {
    getCanvas: function() { return cvs; },
    test: function() {console.log('asdf')},

    reset: function(curve, evt) {
      cvs.width = cvs.width;
      this.ctx.strokeStyle = "black";
      this.ctx.fillStyle = "none";
      if (evt && curve) {
        curve.mouse = {x: evt.offsetX, y: evt.offsetY};
      }
      randomIndex = 0;
    },

    setColor: function(c) {
      this.ctx.strokeStyle = c;
    },

    noColor: function(c) {
      this.ctx.strokeStyle = "transparent";
    },

    setRandomColor: function() {
      randomIndex = (randomIndex+1) % randomColors.length;
      var c = randomColors[randomIndex];
      this.ctx.strokeStyle = c;
    },

    setRandomFill: function(a) {
      randomIndex = (randomIndex+1) % randomColors.length;
      a = (typeof a === "undefined") ? 1 : a;
      var c = randomColors[randomIndex];
      c = c.replace('hsl(','hsla(').replace(')',','+a+')');
      this.ctx.fillStyle = c;
    },

    setFill: function(c) {
      this.ctx.fillStyle = c;
    },

    noFill: function() {
      this.ctx.fillStyle = "transparent";
    },

    drawSkeleton: function(curve, offset, nocoords) {
      offset = offset || { x:0, y:0 };
      var pts = curve.points;
      this.ctx.strokeStyle = "lightgrey";
      this.drawLine(pts[0], pts[1], offset);
      if(pts.length === 3) { this.drawLine(pts[1], pts[2], offset); }
      else {this.drawLine(pts[2], pts[3], offset); }
      this.ctx.strokeStyle = "black";
      if(!nocoords) this.drawPoints(pts, offset);
    },

    drawCurve: function(curve, offset) {
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
    },

    drawLine: function(p1, p2, offset) {
      offset = offset || { x:0, y:0 };
      var ox = offset.x;
      var oy = offset.y;
      this.ctx.beginPath();
      this.ctx.moveTo(p1.x + ox,p1.y + oy);
      this.ctx.lineTo(p2.x + ox,p2.y + oy);
      this.ctx.stroke();
    },

    drawPoint: function(p, offset) {
      offset = offset || { x:0, y:0 };
      var ox = offset.x;
      var oy = offset.y;
      this.ctx.beginPath();
      this.ctx.arc(p.x + ox, p.y + oy, 5, 0, 2*Math.PI);
      this.ctx.stroke();
    },

    drawPoints: function(points, offset) {
      offset = offset || { x:0, y:0 };
      points.forEach(function(p) {
        this.drawCircle(p, 3, offset);
      }.bind(this));
    },

    drawArc: function(p, offset) {
      offset = offset || { x:0, y:0 };
      var ox = offset.x;
      var oy = offset.y;
      this.ctx.beginPath();
      this.ctx.moveTo(p.x + ox, p.y + oy);
      this.ctx.arc(p.x + ox, p.y + oy, p.r, p.s, p.e);
      this.ctx.lineTo(p.x + ox, p.y + oy);
      this.ctx.fill();
      this.ctx.stroke();
    },

    drawCircle: function(p, r, offset) {
      offset = offset || { x:0, y:0 };
      var ox = offset.x;
      var oy = offset.y;
      this.ctx.beginPath();
      this.ctx.arc(p.x + ox, p.y + oy, r, 0, 2*Math.PI);
      this.ctx.stroke();
    },

    drawbbox: function(bbox, offset) {
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
    },

    drawHull: function(hull, offset) {
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
    },

    drawShape: function(shape, offset) {
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
    },

    drawText: function(text, offset) {
      offset = offset || { x:0, y:0 };
      this.ctx.fillText(text, offset.x, offset.y);
    }
  };
}
