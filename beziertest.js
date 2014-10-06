var cvs = document.querySelector("canvas");
var curve = new Bezier(120,160,32,200,220,260,220,40);
var t = 0.5, forward = true;

// helper function for drawing curves
var drawCurve = function(ctx, curve, offset) {
  offset = offset || { x:0, y:0 };
  var ox = offset.x;
  var oy = offset.y;
  var points = curve.getLUT(100);
  ctx.beginPath();
  var p = points[0], i;
  ctx.moveTo(p.x + ox, p.y + oy);
  for(i=1; i<points.length; i++) {
    p = points[i];
    ctx.lineTo(p.x + ox, p.y + oy);
  }
  ctx.stroke();
  ctx.closePath();
};

// this is where the Bezier object gets used.
(function split() {
  cvs.width = cvs.width;
  var ctx = cvs.getContext("2d");

  //
  // the curve, rendered as two subcurves split at "t"
  //
  var curves = curve.split(t);
  curves[0].color = "red";
  curves[1].color = "blue";
  curves.forEach(function(curve) {
    ctx.strokeStyle = curve.color;
    drawCurve(ctx, curve);
  });

  //
  // The control points
  //
  var s = curve.point(0),
      c1 = curve.point(1),
      c2 = curve.point(2),
      e = curve.point(3);

  ctx.strokeStyle = "grey";
  ctx.beginPath();
  ctx.moveTo(s.x,s.y);
  ctx.lineTo(c1.x,c1.y);
  ctx.arc(c1.x, c1.y, 2, 0, 2*Math.PI);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(e.x,e.y);
  ctx.lineTo(c2.x,c2.y);
  ctx.arc(c2.x, c2.y, 2, 0, 2*Math.PI);
  ctx.stroke();


  //
  // the splitting point
  //
  c = curve.get(t);
  ctx.strokeStyle = "black";
  ctx.beginPath();
  ctx.arc(c.x, c.y, 5, 0, 2*Math.PI);
  ctx.stroke();

  var l=25;

  //
  // the "normalised" tangent vector at "t"
  //
  var d = curve.derivative(t);
  ctx.strokeStyle = "green";
  ctx.beginPath();
  ctx.moveTo(c.x, c.y);
  var q = Math.sqrt(d.x*d.x + d.y*d.y)
  ctx.lineTo(c.x + l * d.x/q, c.y + l * d.y/q);
  ctx.stroke();

  //
  // the normal vector at "t"
  //
  var n = curve.normal(t);
  ctx.strokeStyle = "red";
  ctx.beginPath();
  ctx.moveTo(c.x, c.y);
  ctx.lineTo(c.x + l * n.x, c.y + l * n.y);
  ctx.stroke();

  //
  // All inflection points for the curve
  //
  var roots = curve.roots().roots;
  ctx.strokeStyle = "purple";
  roots.forEach(function(t) {
    c = curve.get(t);
    ctx.beginPath();
    ctx.arc(c.x, c.y, 5, 0, 2*Math.PI);
    ctx.stroke();
  });

  //
  // Show the terminals, for good measure
  //
  ctx.strokeStyle = "red";
  ctx.beginPath();
  c = curve.get(0);
  ctx.arc(c.x, c.y, 2, 0, 2*Math.PI);
  ctx.stroke();

  ctx.strokeStyle = "blue";
  ctx.beginPath();
  c = curve.get(1);
  ctx.arc(c.x, c.y, 2, 0, 2*Math.PI);
  ctx.stroke();

  //
  // The curve's bounding box
  //
  ctx.strokeStyle = "rgba(255,0,0," + Math.max(0,t/3) + ")";
  var bbox = curve.bbox();
  ctx.beginPath();
  ctx.moveTo(bbox.x.min, bbox.y.min);
  ctx.lineTo(bbox.x.min, bbox.y.max);
  ctx.lineTo(bbox.x.max, bbox.y.max);
  ctx.lineTo(bbox.x.max, bbox.y.min);
  ctx.lineTo(bbox.x.min, bbox.y.min);
  ctx.stroke();

  //
  // The "offset curve", which is actually a poly-bezier
  //
  ctx.strokeStyle = "lightgrey";
  curve.reduce().forEach(function(segment) {
    [-l/2, l].forEach(function(d) {
      var scaled = segment.scale(d);
      drawCurve(ctx, scaled);
      for(var t=0,p1,p2; t<=1; t++) {
        p1 = segment.get(t);
        p2 = scaled.get(t);
        ctx.beginPath();
        ctx.moveTo(p1.x,p1.y);
        ctx.lineTo(p2.x,p2.y);
        ctx.stroke();
      }
    })
  });

  // and then we just go draw the next frame.
  if (t>1) { forward = false; }
  if (t<0) { forward = true; }
  t = t + (forward? 1 : -1) * 0.01;
  setTimeout(split, 25);
}());
