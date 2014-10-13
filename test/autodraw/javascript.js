schedule(function() {

  var cvs = find("canvas");
  cvs.width = cvs.getBoundingClientRect().width;
  var ctx = cvs.getContext("2d");

  function sqr(x) { return x * x;  }

  var dist = function(p1, p2, dx, dy) { dx = p2.x-p1.x; dy = p2.y-p1.y; return Math.sqrt(dx*dx+dy*dy); };

  function dist2(v, w) { return sqr(v.x - w.x) + sqr(v.y - w.y); }

  function distToSegmentSquared(p, v, w) {
    var l2 = dist2(v, w);
    if (l2 === 0) return dist2(p, v);
    var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    if (t < 0) return dist2(p, v);
    if (t > 1) return dist2(p, w);
    return dist2(p, { x: v.x + t * (w.x - v.x), y: v.y + t * (w.y - v.y) });
  }

  function distToSegment(p, v, w) { return Math.sqrt(distToSegmentSquared(p, v, w)); }

  // project point p3 on line [p1--p2]. Mmm linear algebra.
  var project = function(p1, p2, p3) {
    var m = (p2.y - p1.y) / (p2.x - p1.x),
        b = p1.y - (m * p1.x),
        x = (m * p3.y + p3.x - m * b) / (m * m + 1),
        y = (m * m * p3.y + m * p3.x + b) / (m * m + 1);
    return {x:x, y:y};
  };

  // line-line intersection. More linear algebra!
  var lli = function(p1, p2, p3, p4) {
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

  // Bezier abstraction based on RDP reduced coordinates
  var abstract = (function() {
    // create a virtual start and end point for CR-splining
    function prep(c,m,p5,p6,dx,dy) {
      m = c.length - 1;
      dx = c[1].x-c[0].x;
      dy = c[1].y-c[0].y;
      p5 = { x: c[0].x - dx, y: c[0].y - dy };
      dx = c[m].x-c[m-1].x;
      dy = c[m].y-c[m-1].y;
      p6 = { x: c[m].x + dx, y: c[m].y + dy };
      return [p5].concat(c).concat([p6]);
    }
    // form bezier segments using catmull-rom-to-bezier conversion
    function convert(c,p1,p2,p3,p4,dx,dy,cx1,cy1,cx2,cy2,p5,ci) {
      var l = c.length, i, curves=[], f=1;
      c = prep(c);
      for(i=1; i<l; i++) {
        p1 = c[i-1]; p2 = c[i]; p3 = c[i+1]; p4 = c[i+2];
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
    // angle between p1-p2 and p2-p3
    function getAngle(p1,p2,p3) {
      var atan2 = Math.atan2,
          v1 = { x: p2.x - p1.x, y: p2.y - p1.y },
          v2 = { x: p3.x - p2.x, y: p3.y - p2.y };
      return atan2(v2.y, v2.x) - atan2(v1.y, v1.x);
    }
    // positive or negative winding triangle?
    function getTriangleWinding(p1,p2,p3) {
      if(p2 && p3) {
        p1 = getAngle(p1,p2,p3);
      }
      return p1 > 0 ? 1 : -1;
    }
    // split the list of coordinates when we see a kink or discontinuity
    function split(c) {
      var threshold = Math.PI/3;
      var list = [], i, s, p0, p1, p2, p3, a, b, t = Math.PI/2;
      for(s=0,i=0; i<c.length-2; i++) {
        p1 = c[i]; p2 = c[i+1]; p3 = c[i+2];
        // if the forward angle is not ina 45 degree cone wrt the
        // incoming direction, we're going to treat it as "this is a cut"
        a = getAngle(p1,p2,p3);
        if(Math.abs(a) > threshold) {
          list.push(c.slice(s,i+2));
          s=i+1;
          continue;
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
      console.log(list.length + " segments");
      list.forEach(function(list) {
        curves = curves.concat(convert(list));
      });
      return curves;
    };
  }());

  // Ramer–Douglas–Peucker simplification
  var rdp = (function() {
    var threshold = 2.5;
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
      if(md > threshold) {
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

  // curve merging
  var merge = (function() {
    var fit = function(curve, list) {
      var LUT = [], b, steps = (1000/list.length)|0;
      list.forEach(function(c) {
        b = new Bezier([c.s, c.c1, c.c2, c.e]);
        LUT = LUT.concat(b.getLUT(steps));
      });
      var s = list[0].s,
          e = list[list.length-1].e,
          error = 0,
          len = LUT.length,
          d = false;
      // compute the least-squares error.
      LUT.forEach(function(p) {
        d = distToSegment(p,s,e);
        error += d;
      });
      error = error / len;
      // FIXME: this number is arbitrary atm
      return error < 5;
    };

    // Can we merge this list to a single curve?
    // If so, return that curve. Otherwise, false.
    var trymerge = function(list) {
      if (list.length === 1) return list[0];

      var last = list.length-1,
          midl = list.length/2,
          s = list[0].s;
          e = list[last].e,
          p = false;

      // find midpoint naively, for now.
      if(list.length % 2 == 0) {
        p = list[list.length/2].s;
      } else {
        p = {
          x: (list[midl|0].s.x + list[(0.5+midl)|0].s.x)/2,
          y: (list[midl|0].s.y + list[(0.5+midl)|0].s.y)/2
        }
      }

      // axis-align the three points
      var tx = s.x,
          ty = s.y,
          dx = e.x - tx,
          dy = e.y - ty,
          sin = Math.sin,
          cos = Math.cos,
          a = -atan2(dy,dx),
          B;
      s  = { x: 0, y: 0 };
      B  = { x: (p.x-tx)*cos(a) - (p.y-ty)*sin(a), y: (p.x-tx)*sin(a) + (p.y-ty)*cos(a) };
      e  = { x: (e.x-tx)*cos(a) - (e.y-ty)*sin(a), y: 0 };

      // find the moulding coordinates - see http://pomax.github.io/bezierinfo/#moulding
      var C = project(s,e,B),
          d1 = dist(B, C),
          ratio = 1/3, // given t=0.5
          d2 = d1 * ratio,
          A = { x: B.x, y: B.y + d2 };

      // set up the true curves approximation, and use if the fit's decent enough
      s = list[0].s;
      e = list[last].e;
      A = {
        x: tx + A.x*cos(-a) - A.y*sin(-a),
        y: ty + A.x*sin(-a) + A.y*cos(-a)
      };
      var newcurve = { s: s, c1: A, c2: A, e: e };
      if(fit(newcurve,list)) { return newcurve; }
      return false;
    };

    /**
     * Try to collapse multiple curves into single curves
     */
    var merge = function(curves) {
      // FIXME: this still misses some segments.
      var ret = [], s=0, i, len = curves.length, c, list, merged;
      for(s=0, i=1; i<len; i++) {
        list = curves.slice(s,i);
        var _ = trymerge(list);
        if(!_) {
          // previous attempt worked. Store that, and then keep going.
          ret.push(merged);
          s = i - 1;
          continue;
        }
        merged = _;
      }
      ret.push(merged);
      return ret;
    };

    return merge;
  }())

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
    cvs.width = cvs.width;

    ctx.strokeStyle="rgba(100,100,200,0.1)";
    coords.forEach(function(p) {
      ctx.beginPath();
      ctx.arc(p.x,p.y,0.2,0,tau);
      ctx.stroke();
    });

    ctx.strokeStyle="red";
    var _coords = rdp(coords);
    _coords.forEach(function(p) {
      ctx.beginPath();
      ctx.arc(p.x,p.y,1,0,tau);
      ctx.stroke();
    });

    ctx.strokeStyle = "red";
    var beziers = abstract(_coords);

    beziers.forEach(function(c) {
      ctx.beginPath();
      ctx.moveTo(c.s.x, c.s.y);
      ctx.bezierCurveTo(c.c1.x, c.c1.y, c.c2.x, c.c2.y, c.e.x, c.e.y);
      ctx.stroke();
    });

/*
    ctx.translate(cvs.width/2,0);
    ctx.strokeStyle = "grey";
    var reduced = merge(beziers);
    reduced.forEach(function(c) {
      ctx.beginPath();
      ctx.moveTo(c.s.x, c.s.y);
      ctx.bezierCurveTo(c.c1.x, c.c1.y, c.c2.x, c.c2.y, c.e.x, c.e.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(c.s.x,c.s.y,0.5,0,tau);
      ctx.stroke();
    });
*/
  }

  cvs.listen("mousedown", md);
  cvs.listen("mousemove", mm);
  cvs.listen("mouseup", me);
});
