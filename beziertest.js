// var lpts = [{x:120,y:160}, {x:32,y:200}, {x:220,y:260}, {x:220,y:40}];
// var lpts = [{x:117,y:42}, {x:341,y:123}, {x:127,y:271}, {x:48,y:155}];
// var lpts = [0, 0, 100, 100, -89.2330704, -89.3673477, 36.6374702, 38.3831291];
// var lpts = [238, 52, 307, 266, 11, 22, 80, 221],
var lpts = [238, 52, 248, 253, 11, 22, 243, 52 ],
    curve = new Bezier(lpts),
    iroots = [],
    intersections = false,
    outline = false,
    t = 0.5,
    tstep = 0.01,
    forward = true,
    offset = 25,
    cvs = document.querySelector("canvas"),
    ctx = cvs.getContext("2d"),
    loop = true;

function above(p1,p2,p) {
  return ((p2.x-p1.x)*(p.y-p1.y)-(p.x-p1.x)*(p2.y-p1.y));
}

function intersects(line1,line2) {
  var o = BezierUtils.lli(line1, line2);
  var mx = Math.min(line1.x, line1.c.x),
      my = Math.min(line1.y, line1.c.y),
      MX = Math.max(line1.x, line1.c.x),
      MY = Math.max(line1.y, line1.c.y),
      on1 = (mx <= o.x && o.x <= MX && my <= o.y && o.y <= MY);
  mx = Math.min(line2.x, line2.c.x);
  my = Math.min(line2.y, line2.c.y);
  MX = Math.max(line2.x, line2.c.x);
  MY = Math.max(line2.y, line2.c.y);
  var on2 = (mx <= o.x && o.x <= MX && my <= o.y && o.y <= MY);
  return on1 && on2;
}

/**
 * winding number for a point in a poly-bezier outline shape
 */
function windingnumber(p, outline) {
  var windings = 0,
      start = outline[0],
      segment = start,
      line1 = {x:0,y:0,c:p},
      line2,p1,p2,o;
  do {
    p1 = segment.points[0];
    p2 = segment.points[3];
    line2 = {x:p1.x,y:p1.y,c:p2};
    o = intersects(line1,line2);
    if(o) {
      console.log(p.x,"/",p.y,",",p1.x,"/",p1.y,",",p2.x,"/",p2.y, above(p1,p2,p))
      windings += above(p1,p2,p) > 0 ? 1 : -1;
    }
    segment = segment.next;
  } while (segment !== start);
  return windings < 0 ? -windings : windings;
}

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


  outline = outline || curve.outline(offset, offset/2);

  var ofs = 600,
      i,j,roots,p;

  //
  // Draw "self"-intersections in the outline shape
  //
  if(!intersections) {
    // find al the self intersection points
    intersections = [];
    for(var i=0, si; i<outline.length-1; i++) {
      si = outline[i];
      for(var j=i+2, sj; j<outline.length; j++) {
        // note: we want +2, not +1, because otherwise we'll find
        // intersections where two simple curves meet, and that's
        // easily over a hundred false positives O_O!
        sj = outline[j];
        var roots = si.intersects(sj);
        if(roots.length > 0) {
          intersections = intersections.concat(roots.map(function(v) {
            var s = v.split("/");
            si.addIS(sj, s[0]);
            sj.addIS(si, s[1]);
            return [{c:si, t:s[0]}, {c:sj, t:s[1]}];
          }));
        }
      }
    }

    // Resolve intersections (as union).
    if(intersections && intersections.length > 0) {
      // step 1: find all segments with intersections and
      // replace them with "involved in intersections" equivalents.
      for(var i=outline.length-1; i>=0; i--) {
        var segment = outline[i];
        if(segment.intersections) {
          var segments = segment.splitintersections();
          outline.splice(i,1);
          segments.forEach(function(segment,j) {
            outline.splice(i+j,0,segment);
          });
        }
      }

      function add(p1,p2,f) {
        return {x:p1.x+f*p2.x,y:p1.y+f*p2.y};
      }

      function lerp(p1,p2) {
        return {x:(p1.x+p2.x)/2,y:(p1.y+p2.y)/2};
      }

      // For all intersecting segments, also whether offset
      // points just above/below the curve are both inside
      // our shape. If so, this edge needs to go. If only
      // one of them's inside the shape, it's a true edge.
      var start = outline[0], segment = start;
      do {
        if(segment.intersecting) {
          var op = segment.get(0.5);
          var op1 = add(lerp(segment.points[0],segment.points[3]), segment.normal(0.5), 3);
          var i1 = windingnumber(op1, outline, segment);
          var op2 = add(lerp(segment.points[0],segment.points[3]), segment.normal(0.5), -3);
          var i2 = windingnumber(op2, outline, segment);
          console.log("winding for ", op1, ":", i1);
          if(i1 > 0 && i2 > 0) {
            segment.enclosed = true;
          }
        }
        segment = segment.next;
      } while (segment !== start);
    }
  }

  if(intersections && intersections.length>0) {
    ctx.strokeStyle = "rgba(100,0,100,0.5)";
    intersections.forEach(function(pair) {
      p = pair[0].c.get(pair[0].t);
      drawCircle(p,2,{x:ofs,y:0});


    });

    outline.forEach(function(s) {
      if(s.intersecting) {
        ctx.strokeStyle="green";
        drawCurve(s, {x:ofs, y:0});
      }
      if(s.enclosed) {
        ctx.strokeStyle="red";
        drawCurve(s, {x:ofs, y:0});
      }
    })
  }

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


  //
  // Check for self-intersection
  //
  var self_intersections = curve.intersects();
  self_intersections.forEach(function(v) {
    v.split("/").map(function(v) { return parseFloat(v); }).forEach(function(t) {
      var c = curve.get(t);
      drawPoint(c, {x:300, y:0});
    });
  });

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
