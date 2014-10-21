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
    shapeiss = false;
    t = 0.5,
    tstep = 0.01,
    forward = true,
    offset = 25,
    cvs = document.querySelector("canvas"),
    ctx = cvs.getContext("2d"),
    mouseMove = false,

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
  // and the simple subcurve bounding boxes
  //
  var reduced = curve.reduce();
  ctx.strokeStyle = "rgba(0,100,50," + (0.81-Math.max(0,0.8*t)) + ")";
  reduced.forEach(function(segment) {
    drawbbox(segment.bbox());
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


// next panel!
var ofs = {x:300, y:0};


  //
  // Show curve self intersections, if there is one
  //
  ctx.strokeStyle = "rgb(50,20,0)";
  drawCurve(curve, ofs);
  var selfintersections = curve.intersects();
  if(selfintersections.length>0) {
    drawPoint(curve.get(parseFloat(selfintersections[0].split("/")[0])), ofs);
  }


  //
  // The "offset curve", which is actually a poly-bezier, offset on both sides.
  //
  outline = outline || curve.outline(offset, offset/2);
  ctx.strokeStyle = "lightgrey";
  for(var i=0, len=outline.length; i<len; i++) {
    drawCurve(outline[i], ofs)
    if(0<i && i<len/2-1) {
      // outline[0] and outline[len-1] are end caps,
      // but let's also draw all the virtual end caps
      drawLine(outline[i].points[0], outline[len-i].points[3], ofs);
    }
  }


// next panel!
var ofs = {x:600, y:0};


  // convert outline to a series of simple-offset shapes instead
  var shapes = shapes || curve.outlineshapes(offset, offset/2);

  //
  // Draw the offset outline as a filled shape
  // next to the original curve.
  //
  ctx.strokeStyle = "grey";
  ctx.fillStyle = "rgba(255,225,0,0.2)";
  shapes.forEach(function(shape,idx) {
    drawShape(shape, ofs);
  });


  //
  // find intersections between individual shapes
  //
  if(shapeiss === false) {
    shapeiss = [];
    for(var i=0; i<shapes.length-1; i++) {
      var si = shapes[i];
      for(var j=i+2; j<shapes.length; j++) {
        var sj = shapes[j];
        var sis =si.intersections(sj);
        if(sis.length>0) {
          shapeiss = shapeiss.concat(sis);
          // TODO: actually resolve these intersections, too!
        }
      }
    }
  }


  //
  // Show shape "self" intersections
  //
  ctx.fillStyle = "rgba(255,0,0,0.2)";
  shapeiss.forEach(function(s) {
    s.forEach(function(str) {
      drawPoint(s.c1.get(str.split("/")[0]), ofs);
    });
    drawShape(s.s1, ofs);
    drawShape(s.s2, ofs);
  });


  //
  // Show the intersections of this curve's outline with a fixed line
  //
  var line = { p1: {x:20, y:225}, p2: {x:280, y:120} };
  ctx.strokeStyle = "darkgrey";
  drawLine(line.p1, line.p2, ofs);
  if(iroots.length===0) {
    outline.forEach(function(s) {
      s.intersects(line)
       .map(function(t) { return s.get(t); })
       .forEach(function(p) { iroots.push(p); });
    });
  }
  ctx.strokeStyle = "black";
  iroots.forEach(function(p) { drawCircle(p,2,ofs); });


// DONE


  // Now we just go draw the next frame.
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
