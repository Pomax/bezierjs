schedule(function() {

  var cvs = find("canvas");
  var ctx = cvs.getContext("2d");

  // Bezier abstraction based on RDP reduced coordinates
  var abstract = (function() {
    // create a virtual start and end point for CR-splining
    function prep(c,l,p1,p2,p3,p4,p5,p6,dx,dy) {
      l = c.length;
      p1 = c[0];
      p2 = c[1];
      p3 = c[l-2];
      p4 = c[l-1];
      dx = p2.x-p1.x;
      dy = p2.y-p1.y;
      p5 = { x: p1.x - dx, y: p1.y - dy };
      dx = p4.x-p3.x;
      dy = p4.y-p3.y;
      p6 = { x: p4.x + dx, y: p4.y + dy };
      return [p5].concat(c).concat([p6]);
    }
    // form bezier segments using catmull-rom-to-bezier conversion
    function convert(c,p1,p2,p3,p4,cx1,cy1,cx2,cy2,p5) {
      var l = c.length, i, curves=[], f=1;
      c = prep(c);
      for(i=1; i<l; i++) {
        p1 = c[i-1];
        p2 = c[i  ];
        p3 = c[i+1];
        p4 = c[i+2];
        cx1 = (p3.x-p1.x)/(6*f);
        cy1 = (p3.y-p1.y)/(6*f);
        cx2 = (p4.x-p2.x)/(6*f);
        cy2 = (p4.y-p2.y)/(6*f);
        p5 = {
          s: p2,
          c1: { x: p2.x + cx1, y: p2.y + cy1 },
          c2: { x: p3.x - cx2, y: p3.y - cy2 },
          e: p3
        };
        curves.push(p5);
      }
      return curves;
    }
    // angle between two vectors
    function getAngle(v1,v2,v3) {
      var x1 = v1.x - v2.x,
          y1 = v1.y - v2.y,
          m1 = Math.sqrt(x1*x1+y1*y1),
          x2 = v3.x - v2.x,
          y2 = v3.y - v2.y,
          m2 = Math.sqrt(x2*x2+y2*y2),
          m = m1*m2,
          d = x1*x2+y1*y2;
      return Math.acos(d/m);
    }
    // split the list of coordinates on any 'acute' transition angle
    function split(c) {
      var list = [], i, s, p1, p2, p3, a, t = Math.PI/2;
      for(s=0,i=0; i<c.length-2; i++) {
        p1 = c[i];
        p2 = c[i+1];
        p3 = c[i+2];
        a = getAngle(p1,p2,p3);
        if(a < t) {
          list.push(c.slice(s,i+2));
          s=i+1;
        }
      }
      if(s<c.length-1) {
        list.push(c.slice(s));
      }
      return list;
    }
    // turn into beziers. sort of.
    return function(coords) {
      var curves = [];
      var list = split(coords);
      list.forEach(function(list) {
        curves = curves.concat(convert(list));
      });
      return curves;
    };
  }());


  // Ramer–Douglas–Peucker simplification
  var rdp = (function() {
    function sqr(x) { return x * x;  }
    function dist2(v, w) { return sqr(v.x - w.x) + sqr(v.y - w.y); }
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
    function rdp(coords) {
      if(coords.length===2) {
        coords[0].keep = true;
        coords[1].keep = true;
        return;
      }
      var l = coords.length-1,
          s = 0, e = l, p,i,d, md = 0, mdi = 0,
          v = coords[s],
          w = coords[e];
      for(i=s+1; i<e-1; i++) {
        p = coords[i];
        d = distToSegment(p, v, w);
        if(d>md) { md=d; mdi=i; }
      }
      if(md > 3) {
        var l1 = coords.slice(s,mdi+1);
        var l2 = coords.slice(mdi);
        rdp(l1);
        rdp(l2);
      } else {
        v.keep = true;
        w.keep = true;
      }
      return coords.filter(function(v) {
        return v.keep;
      });
    }
    return rdp;
  }());

  /*****
    Drawing etc. is handled here.
  *****/

  ctx.strokeStyle = "black";
  var coords, recording, tau = Math.PI*2;
  var point = function(evt) {
    var x = evt.offsetX;
    var y = evt.offsetY;
    coords.push({ x:x, y:y });
    ctx.beginPath();
    ctx.arc(x,y,0.1,0,tau);
    ctx.stroke();
  };

  function md (evt) {
    ctx.strokeStyle = "black";
    recording = true;
    coords = [];
    point(evt);
  }

  function mm(evt) {
    if(recording) {
      point(evt);
    }
  }

  function me(evt) {
    recording = false;
    var _coords = rdp(coords);
    cvs.width = cvs.width;
    _coords.forEach(function(p) {
      ctx.beginPath();
      ctx.arc(p.x,p.y,0.2,0,tau);
      ctx.stroke();
    });
    ctx.strokeStyle = "green";
    var beziers = abstract(_coords);
    beziers.forEach(function(c) {
      ctx.beginPath();
      ctx.moveTo(c.s.x, c.s.y);
      ctx.bezierCurveTo(c.c1.x, c.c1.y, c.c2.x, c.c2.y, c.e.x, c.e.y);
      ctx.stroke();
    });
  }

  cvs.listen("mousedown", md);
  cvs.listen("mousemove", mm);
  cvs.listen("mouseup", me);
});
