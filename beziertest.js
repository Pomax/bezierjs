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
  // the splitting point
  //
  var c = curve.get(t);
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
  if(roots.indexOf(0) === -1) { roots = [0].concat(roots); }
  if(roots.indexOf(1) === -1) { roots.push(1) }
  ctx.strokeStyle = "purple";
  roots.forEach(function(t) {
    c = curve.get(t);
    ctx.beginPath();
    ctx.arc(c.x, c.y, 5, 0, 2*Math.PI);
    ctx.stroke();
  });

  //
  // The "offset curve", which is actually a poly-bezier
  //
  ctx.strokeStyle = "lightgrey";
  curve.reduce().forEach(function(segment) {
    var scaled = segment.scale(l);
    drawCurve(ctx, scaled);
    for(var t=0,p1,p2; t<=1; t++) {
      p1 = segment.get(t);
      p2 = scaled.get(t);
      ctx.beginPath();
      ctx.moveTo(p1.x,p1.y);
      ctx.lineTo(p2.x,p2.y);
      ctx.stroke();
    }
  });

  // and then we just go draw the next frame.
  if (t>1) { forward = false; }
  if (t<0) { forward = true; }
  t = t + (forward? 1 : -1) * 0.01;
  setTimeout(split, 25);
}());
