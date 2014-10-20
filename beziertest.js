// var lpts = [{x:120,y:160}, {x:32,y:200}, {x:220,y:260}, {x:220,y:40}];
// var lpts = [{x:117,y:42}, {x:341,y:123}, {x:127,y:271}, {x:48,y:155}];
// var lpts = [0, 0, 100, 100, -89.2330704, -89.3673477, 36.6374702, 38.3831291];
// var lpts = [238, 52, 307, 266, 11, 22, 80, 221],
var lpts = [238, 52, 248, 253, 11, 22, 243, 52 ],
    curve = new Bezier(lpts),
    iroots = [],
    intersections = false,
    outline = false,
    shapes = false;
    t = 0.5,
    tstep = 0.01,
    forward = true,
    offset = 25,
    cvs = document.querySelector("canvas"),
    ctx = cvs.getContext("2d"),

    loop = true;

/**
 * compute and show the arc length of a curve
 */
function showArcLength() {
  var precision = 100000,
      len = ((precision*curve.length())|0)/precision;
  document.querySelector("#arclength").textContent = len;
}

/**
 * this is where the Bezier object gets used.
 */
function drawFrame() {
  // more memory efficient than ctx.clearRect() for unknown reasons
  cvs.width = cvs.width;
  ctx = cvs.getContext("2d");

  //
  // Draw the curve, rendered as two subcurves split at "t"
  //
  var curves = curve.split(t);
  curves[0].color = "red";
  curves[1].color = "blue";
  curves.forEach(function(curve) {
    ctx.strokeStyle = curve.color;
    drawCurve(curve);
  });


  //
  // Draw the control points
  //
  var s = curve.point(0),
      c1 = curve.point(1),
      c2 = curve.point(2),
      e = curve.point(3);

  ctx.strokeStyle = "grey";
  drawLine(s, c1);
  drawCircle(c1, 2);
  drawLine(e, c2);
  drawCircle(c2, 2);


  //
  // the splitting point
  //
  c = curve.get(t);
  ctx.strokeStyle = "black";
  drawCircle(c,5);

  //
  // the "normalised" tangent vector at "t"
  //
  var d = curve.derivative(t),
      q = Math.sqrt(d.x*d.x + d.y*d.y),
      ntv = {x: c.x + offset * d.x/q, y: c.y + offset * d.y/q};
  ctx.strokeStyle = "green";
  drawLine(c,ntv);

  //
  // the normal vector at "t"
  //
  var n = curve.normal(t),
      nv = {x:c.x + offset * n.x, y:c.y + offset * n.y};
  ctx.strokeStyle = "red";
  drawLine(c,nv);


  //
  // All inflection points for the curve
  //
  var inflections = curve.inflections().values;
  ctx.strokeStyle = "purple";
  inflections.forEach(function(t) {
    drawCircle(curve.get(t), 5);
  });


  //
  // The curve's bounding box
  //
  ctx.strokeStyle = "rgba(255,0,0," + Math.max(0,0.5*t) + ")";
  drawbbox(curve.bbox());


  //
  // The "offset curve", which is actually a poly-bezier
  //
  var ofs = 300;
  ctx.strokeStyle = "rgb(50,20,0)";
  drawCurve(curve, {x:ofs,y:0});
  var reduced = curve.reduce();
  reduced.forEach(function(segment) {
    // subcurve bounding boxes!
    ctx.strokeStyle = "rgba(0,100,50," + (0.81-Math.max(0,0.8*t)) + ")";
    drawbbox(segment.bbox());

    ctx.strokeStyle = "lightgrey";
    [-offset/2, offset].forEach(function(d) {
      var scaled = segment.scale(d);
      drawCurve(scaled, {x:ofs,y:0});
      for(var t=0,p1,p2; t<=1; t++) {
        p1 = segment.get(t);
        p2 = scaled.get(t);
        drawLine(p1,p2,{x:ofs,y:0});
      }
    })
  });


  //
  // Show the terminals, for good measure
  //
  c = curve.get(0);
  ctx.strokeStyle = "red";
  drawCircle(c,2);

  c = curve.get(1);
  ctx.strokeStyle = "blue";
  drawCircle(c,2);


  var ofs = 600,
      i,j,roots,p,

  // get the global outline
  outline = outline || curve.outline(offset, offset/2);

  // convert outline to a series of simple-offset shapes instead
  shapes = shapes || (function(outline) {
    var makeline = function(p1,p2) {
      var x1 = p1.x, y1=p1.y, x2=p2.x, y2=p2.y,
          dx = (x2-x1)/3, dy = (y2-y1)/3;
      return new Bezier(x1, y1, x1+dx, y1+dy, x1+2*dx, y1+2*dy, x2, y2);
    };
    var shapes = [];
    for(var i=1,len=outline.length; i<len/2; i++) {
      var shape = {
        forward: outline[i],
        back: outline[len-i]
      };
      shape.caps = {
        start: makeline(shape.back.points[3], shape.forward.points[0]),
        end: makeline(shape.forward.points[3], shape.back.points[0])
      };
      shape.caps.start.virtual = (i > 1);
      shape.caps.end.virtual = (i < len/2-1);
      shape.bbox = (function() {
        var mx=9999,my=mx,MX=-99999,MY=MX;
        var sections = [shape.caps.start, shape.forward, shape.back, shape.caps.end];
        sections.forEach(function(s) {
          var bbox = s.bbox();
          if(mx > bbox.x.min) mx = bbox.x.min;
          if(my > bbox.y.min) my = bbox.y.min;
          if(MX < bbox.x.max) MX = bbox.x.max;
          if(MY < bbox.y.max) MY = bbox.y.max;
        });
        return {
          x: { min: mx, mid:(mx+MX)/2, max: MX, size:MX-mx },
          y: { min: my, mid:(my+MY)/2, max: MY, size:MY-my }
        }
      }());
      shapes.push(shape);
    }
    return shapes;
  }(outline));

  //
  // Draw the offset outline as a filled shape
  // next to the original curve.
  //
  ctx.strokeStyle = "grey";
  ctx.fillStyle = "rgba(255,225,0,0.2)";
  shapes.forEach(function(shape) {
    drawShape(shape, {x:ofs, y:0});
    //drawbbox(shape.bbox, {x:ofs, y:0});
  });

  function shapeintersection(s1, bbox1, s2, bbox2) {
    if(!BezierUtils.bboxoverlap(bbox1, bbox2)) {
      return [];
    }
    var intersections = [];
    var a1 = [s1.caps.start, s1.forward, s1.back, s1.caps.end];
    var a2 = [s2.caps.start, s2.forward, s2.back, s2.caps.end];
    a1.forEach(function(l1) {
      if(l1.virtual) return;
      a2.forEach(function(l2) {
        if(l2.virtual) return;
        var iss = l1.intersects(l2);
        if(iss.length>0) {
          iss.c1 = l1;
          iss.c2 = l2;
          intersections.push(iss);
        }
      });
    });
    return intersections;
  }

  //
  // find intersections between individual shapes
  //
  for(var i=0; i<shapes.length-1; i++) {
    var si = shapes[i];
    for(var j=i+2; j<shapes.length; j++) {
      var sj = shapes[j];
      var sis = shapeintersection(si,si.bbox,sj,sj.bbox);
      if(sis.length>0) {
        ctx.fillStyle = "rgba(255,0,0,0.2)";
        drawShape(si, {x:ofs, y:0});
        drawShape(sj, {x:ofs, y:0});
        // TODO: and actually resolve these.
        sis.forEach(function(s) {
          s.forEach(function(str) {
            var p = s.c1.get(str.split("/")[0]);
            drawPoint(p, {x:ofs, y:0});
          });
        });
      }
    }
  }

/*
  //
  // Draw the offset outline as a filled shape
  // next to the original curve.
  //
  ctx.strokeStyle = "grey";
  ctx.fillStyle = "rgba(255,225,0,0.2)";
  ctx.beginPath();
  var start = outline[0], segment = start;
  ctx.moveTo(ofs + start.points[0].x, start.points[0].y);
  do {
    p = segment.points;
    ctx.bezierCurveTo(ofs + p[1].x, p[1].y, ofs + p[2].x, p[2].y, ofs + p[3].x, p[3].y);
    segment = segment.next;
  } while (segment !== start);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
*/

  //
  // Show intersections with a line
  //
  var line = { p1: {x:20, y:225}, p2: {x:280, y:120} };
  ctx.strokeStyle = "darkgrey";
  drawLine(line.p1, line.p2, {x:ofs,y:0});

  if(iroots.length===0) {
    outline.forEach(function(s) {
      s.intersects(line)
       .map(function(t) { return s.get(t); })
       .forEach(function(p) { iroots.push(p); });
    });
  }

  ctx.strokeStyle = "black";
  iroots.forEach(function(p) { drawCircle(p,2,{x:ofs,y:0}); });

  // and then we just go draw the next frame.
  (function nextFrame() {
    if (t>1) { forward = false; }
    if (t<0) { forward = true; }
    t = t + (forward? 1 : -1) * tstep;
    if(loop) setTimeout(drawFrame, 25);
  }());
}

// Run all the things.
showArcLength();
drawFrame();
