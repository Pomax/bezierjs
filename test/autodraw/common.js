var tau = Math.PI*2;

function sqr(x) {
  return x * x;
}

function dist(p1, p2, dx, dy) {
  dx = p2.x-p1.x;
  dy = p2.y-p1.y;
  return Math.sqrt(dx*dx+dy*dy);
};

function dist2(v, w) {
  return sqr(v.x - w.x) + sqr(v.y - w.y);
}


function distToSegmentSquared(p, v, w) {
  var l2 = dist2(v, w);
  if (l2 === 0) return dist2(p, v);
  var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  if (t < 0) return dist2(p, v);
  if (t > 1) return dist2(p, w);
  return dist2(p, { x: v.x + t * (w.x - v.x), y: v.y + t * (w.y - v.y) });
}

function distToSegment(p, v, w) {
  return Math.sqrt(distToSegmentSquared(p, v, w));
}

// project point p3 on line [p1--p2]. Mmm linear algebra.
function project(p1, p2, p3) {
  var m = (p2.y - p1.y) / (p2.x - p1.x),
      b = p1.y - (m * p1.x),
      x = (m * p3.y + p3.x - m * b) / (m * m + 1),
      y = (m * m * p3.y + m * p3.x + b) / (m * m + 1);
  return {x:x, y:y};
};

// line-line intersection. More linear algebra!
function lli(p1, p2, p3, p4) {
  var x1=p1.x, y1=p1.y,
      x2=p2.x, y2=p2.y,
      x3=p3.x, y3=p3.y,
      x4=p4.x, y4=p4.y,
      nx=(x1*y2-y1*x2)*(x3-x4)-(x1-x2)*(x3*y4-y3*x4),
      ny=(x1*y2-y1*x2)*(y3-y4)-(y1-y2)*(x3*y4-y3*x4),
      d=(x1-x2)*(y3-y4)-(y1-y2)*(x3-x4);
  if(d==0) { return false; }
  return { x: nx/d, y: ny/d, z: 0 };
};
