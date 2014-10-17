var cvs = document.querySelector("canvas");
// var lpts = [{x:120,y:160}, {x:32,y:200}, {x:220,y:260}, {x:220,y:40}];
// var lpts = [{x:117,y:42}, {x:341,y:123}, {x:127,y:271}, {x:48,y:155}];
var lpts = [238, 52, 307, 266, 11, 22, 80, 221];
var curve = new Bezier(lpts);
var iroots = [];

// compute the arc length just once, and print it to console for now.
var showArcLength = function() {
  document.querySelector("#arclength").textContent = ((100000*curve.length())|0)/100000;
};

showArcLength();

// User interaction
(function handleInteraction() {
  lpts = curve.points;
  var moving = false, mx = my = ox = oy = 0, cx, cy, mp = false;
  cvs.addEventListener("mousedown", function(evt) {
    mx = evt.offsetX;
    my = evt.offsetY;
    lpts.forEach(function(p) {
      if(Math.abs(mx-p.x)<10 && Math.abs(my-p.y)<10) {
        moving = true;
        mp = p;
        cx = p.x;
        cy = p.y;
      }
    });
  });
  cvs.addEventListener("mousemove", function(evt) {
    iroots = [];
    var found = false;
    lpts.forEach(function(p) {
      var mx = evt.offsetX;
      var my = evt.offsetY;
      if(Math.abs(mx-p.x)<10 && Math.abs(my-p.y)<10) {
        found = found || true;
      }
    });
    cvs.style.cursor = found ? "pointer" : "default";

    if(!moving) return;
    ox = evt.offsetX - mx;
    oy = evt.offsetY - my;
    mp.x = cx + ox;
    mp.y = cy + oy;
  });
  cvs.addEventListener("mouseup", function(evt) {
    if(!moving) return;
    //console.log(curve.points.map(function(p) { return p.x+", "+p.y; }).join(", "));
    showArcLength();
    moving = false;
    mp = false;
  });
}());


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

// helper function for drawing points as circles
var drawPoint = function(ctx, p, offset) {
  offset = offset || { x:0, y:0 };
  var ox = offset.x;
  var oy = offset.y;
  ctx.beginPath();
  ctx.arc(p.x + ox, p.y + oy, 5, 0, 2*Math.PI);
  ctx.stroke();
};

// helperfunction for drawing bounding boxes
var drawbbox = function(ctx, bbox, offset) {
  offset = offset || { x:0, y:0 };
  var ox = offset.x;
  var oy = offset.y;
  ctx.beginPath();
  ctx.moveTo(bbox.x.min + ox, bbox.y.min + oy);
  ctx.lineTo(bbox.x.min + ox, bbox.y.max + oy);
  ctx.lineTo(bbox.x.max + ox, bbox.y.max + oy);
  ctx.lineTo(bbox.x.max + ox, bbox.y.min + oy);
  ctx.closePath();
  ctx.stroke();
};

// start at the mid point, and start moving towards t=1 first.
var t = 0.5, forward = true;


// this is where the Bezier object gets used.
(function drawFrame() {
  cvs.width = cvs.width;
  var ctx = cvs.getContext("2d");
  var offset = 25;

  //
  // Draw the curve, rendered as two subcurves split at "t"
  //
  var curves = curve.split(t);
  curves[0].color = "red";
  curves[1].color = "blue";
  curves.forEach(function(curve) {
    ctx.strokeStyle = curve.color;
    drawCurve(ctx, curve);
  });


  //
  // Draw the control points
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


  //
  // the "normalised" tangent vector at "t"
  //
  var d = curve.derivative(t);
  ctx.strokeStyle = "green";
  ctx.beginPath();
  ctx.moveTo(c.x, c.y);
  var q = Math.sqrt(d.x*d.x + d.y*d.y)
  ctx.lineTo(c.x + offset * d.x/q, c.y + offset * d.y/q);
  ctx.stroke();


  //
  // the normal vector at "t"
  //
  var n = curve.normal(t);
  ctx.strokeStyle = "red";
  ctx.beginPath();
  ctx.moveTo(c.x, c.y);
  ctx.lineTo(c.x + offset * n.x, c.y + offset * n.y);
  ctx.stroke();


  //
  // All inflection points for the curve
  //
  var inflections = curve.inflections().values;
  ctx.strokeStyle = "purple";
  inflections.forEach(function(t) {
    c = curve.get(t);
    ctx.beginPath();
    ctx.arc(c.x, c.y, 5, 0, 2*Math.PI);
    ctx.stroke();
  });


  //
  // The curve's bounding box
  //
  ctx.strokeStyle = "rgba(255,0,0," + Math.max(0,0.5*t) + ")";
  drawbbox(ctx, curve.bbox());


  //
  // The "offset curve", which is actually a poly-bezier
  //
  var ofs = 300;
  ctx.strokeStyle = "rgb(50,20,0)";
  drawCurve(ctx, curve, {x:ofs,y:0});
  var reduced = curve.reduce();
  reduced.forEach(function(segment) {
    // subcurve bounding boxes!
    ctx.strokeStyle = "rgba(0,100,50," + (0.81-Math.max(0,0.8*t)) + ")";
    drawbbox(ctx, segment.bbox());

    ctx.strokeStyle = "lightgrey";
    [-offset/2, offset].forEach(function(d) {
      var scaled = segment.scale(d);
      drawCurve(ctx, scaled, {x:ofs,y:0});
      for(var t=0,p1,p2; t<=1; t++) {
        p1 = segment.get(t);
        p2 = scaled.get(t);
        ctx.beginPath();
        ctx.moveTo(ofs + p1.x,p1.y);
        ctx.lineTo(ofs + p2.x,p2.y);
        ctx.stroke();
      }
    })
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
  // Draw the offset outline as a filled shape
  // next to the original curve.
  //
  (function drawOutline() {
    var outline = curve.outline(offset, offset/2),
        forward = outline["+"],
        back = outline["-"],
        fcurves = [],
        bcurves = [],
        ofs = 600;

    ctx.strokeStyle = "grey";
    ctx.fillStyle = "rgba(255,225,0,0.2)";
    ctx.beginPath();
    ctx.moveTo(ofs + forward[0].p.x, forward[0].p.y);
    for(var i=1, p0, p1, p2, p3; i<forward.length; i+=3) {
      p0 = forward[i-1].p;
      p1 = forward[i].p;
      p2 = forward[i+1].p;
      p3 = forward[i+2].p;
      ctx.bezierCurveTo(ofs + p1.x, p1.y, ofs + p2.x, p2.y, ofs + p3.x, p3.y);
      fcurves.push(new Bezier(p0.x,p0.y,p1.x,p1.y,p2.x,p2.y,p3.x,p3.y));
    }
    ctx.lineTo(ofs + back[0].p.x, back[0].p.y);
    for(var i=1, p0, p1, p2, p3; i<back.length; i+=3) {
      p0 = back[i-1].p,
      p1 = back[i].p;
      p2 = back[i+1].p;
      p3 = back[i+2].p;
      ctx.bezierCurveTo(ofs + p1.x, p1.y, ofs + p2.x, p2.y, ofs + p3.x, p3.y);
      bcurves.push(new Bezier(p0.x,p0.y,p1.x,p1.y,p2.x,p2.y,p3.x,p3.y));
    }
    ctx.closePath();
    ctx.stroke();
    ctx.fill();

    // also show a line intersection
    var line = { p1: {x:20, y:225}, p2: {x:280, y:120} };
    ctx.beginPath();
    ctx.moveTo(ofs + line.p1.x, line.p1.y);
    ctx.lineTo(ofs + line.p2.x, line.p2.y);
    ctx.stroke();

    if(iroots.length===0) {
      var findis = function(c) {
        var roots = c.intersects(line);
        if (roots.length === 0) return;
        roots.forEach(function(t) {
          var p = c.get(t);
          iroots.push(p);
        });
      }
      fcurves.forEach(function(c) { findis(c); });
      bcurves.forEach(function(c) { findis(c); });
    }

    iroots.forEach(function(p) {
      ctx.beginPath();
      ctx.arc(ofs + p.x,p.y,2,0,2*Math.PI);
      ctx.stroke();
    });
  }());


  //
  // Check for self-intersection
  //
  var intersections = curve.intersects();
  intersections.forEach(function(v) {
    v.split("/").map(function(v) { return parseFloat(v); }).forEach(function(t) {
      var c = curve.get(t);
      drawPoint(ctx, c, {x:300, y:0});
    });
  });

  // and then we just go draw the next frame.
  if (t>1) { forward = false; }
  if (t<0) { forward = true; }
  t = t + (forward? 1 : -1) * 0.01;
  setTimeout(drawFrame, 25);
}());
