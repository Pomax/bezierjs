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
      return list.map(function(list) {
        return convert(list);
      });
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

    // vector normalisation
    var normalise = function(v) {
      var m = Math.sqrt(v.x*v.x + v.y*v.y);
      return { x: v.x/m, y:v.y/m };
    }

    // Can we merge this list to a single curve?
    // If so, return that curve. Otherwise, false.
    var trymerge = function(list, forced) {
      console.log(list.length);

      if (list.length === 1) return list[0];

      var last = list.length-1,
          l0 = list[0],
          ll = list[last],
          s = l0.s;
          e = ll.e,
          p = false;

      // find midpoint naively, for now.
      // FIXME: the true 'p' will not lie on this line.
      if(list.length % 2 == 0) {
        p = list[list.length/2].s;
      } else {
        var midl = list.length/2;
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
          atan2 = Math.atan2,
          a = -atan2(dy,dx),
          B;

      // base points
      s  = { x: s.x, y: s.y };
      c1 = { x: l0.c1.x, y: l0.c1.y };  // FIXME: this needs to be aligned with the previous bezier's c2, or there'll be kinks.
      B  = { x: p.x,     y: p.y };
      c2 = { x: ll.c2.x, y: ll.c2.y };
      e  = { x: e.x,     y: e.y };

      // align to axes
      [s,c1,B,c2,e].forEach(function(v) {
        var x = (v.x-tx)*cos(a) - (v.y-ty)*sin(a),
            y = (v.x-tx)*sin(a) + (v.y-ty)*cos(a);
        v.x=x; v.y=y;
      });

      // we know that when A--B:B--C is 0.75, the control points c1 and c2 will coincide.
      // At any ratio lower than that, they will be at a fractional distances along the lines
      // s--A for c1 and A--e for c2. ration=0.75 is full length, ratio=0.375 is half length,
      // ratio=0 is 0 length, and it's just a linear interpolation with those values.
      var o = lli(s,c1,c2,e),
          C = project(s,e,B);

      // B may not be on the line C--o, so let's make sure it is. If this means we move
      // it a considerable amount, we can't do a nice approximation and we return failure.
      var _B = project(o,C,B);
      if(!forced && dist(B,_B) > 2) {
        console.log("nope");
        return false;
      }
      console.log("yep");

      var h1 = dist(B, C),
          h2 = dist(o, C),
          ratio = h1 / h2,
          rh = 1.5 * ratio, // FIXME: why does 1.5 work? The math tells us that this should be 4/3 instead...
          ds = dist(s,o) * rh,
          de = dist(e,o) * rh;

      // normalised control vectors:
      c1 = normalise({ x: (l0.c1.x-l0.s.x), y: (l0.c1.y-l0.s.y) });
      c2 = normalise({ x: (ll.c2.x-ll.e.x), y: (ll.c2.y-ll.e.y) });

      // new curve control points:
      c1 = {
        x: l0.s.x + ds * c1.x,
        y: l0.s.y + ds * c1.y
      };

      c2 = {
        x: ll.e.x + de * c2.x,
        y: ll.e.y + de * c2.y
      };

      o = {
        x: tx + (o.x*cos(-a) - o.y*sin(-a)),
        y: ty + (o.x*sin(-a) + o.y*cos(-a))
      };

     return { s: l0.s, c1: c1, c2: c2, e: ll.e, o:o };
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
          s = i;
          continue;
        }
        merged = _;
      }
      if(s<len-1) {
        ret.push(trymerge(curves.slice(s,len), true));
      }
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
    var x = evt.offsetX==undefined?evt.layerX:evt.offsetX;
    var y = evt.offsetY==undefined?evt.layerY:evt.offsetY;
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

    var _coords = rdp(coords);
    var segments = abstract(_coords);

    // How far do we want to go with our curve abstraction?
    var cm = false;

    // plain catmull-rom fitting
    if(cm) {
      ctx.strokeStyle="red";
      _coords.forEach(function(p) {
        ctx.beginPath();
        ctx.arc(p.x,p.y,1,0,tau);
        ctx.stroke();
      });

      ctx.strokeStyle = "red";
      segments.forEach(function(beziers) {
        beziers.forEach(function(c) {
          ctx.beginPath();
          ctx.moveTo(c.s.x, c.s.y);
          ctx.bezierCurveTo(c.c1.x, c.c1.y, c.c2.x, c.c2.y, c.e.x, c.e.y);
          ctx.stroke();
        });
      });
    }

    // reduced curve fitting -- FIXME: not quite done yet
    else {
      segments.forEach(function(beziers) {
        // FIXME: merge() may yield gaps in the outline
        var reduced = merge(beziers);

        reduced.forEach(function(c) {
          ctx.strokeStyle = "green";
          ctx.beginPath();
          ctx.arc(c.s.x,c.s.y,1.5,0,tau);
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(c.e.x,c.e.y,1.5,0,tau);
          ctx.stroke();

          ctx.strokeStyle = "lightgrey";
          ctx.beginPath();
          ctx.arc(c.c1.x,c.c1.y,1.5,0,tau);
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(c.c2.x,c.c2.y,1.5,0,tau);
          ctx.stroke();

          if(c.o) {
            ctx.beginPath();
            ctx.arc(c.o.x,c.o.y,1.5,0,tau);
            ctx.stroke();
          }
        });

        ctx.strokeStyle = "red";
        reduced.forEach(function(c,i) {
          ctx.beginPath();
          ctx.moveTo(c.s.x, c.s.y);
          ctx.bezierCurveTo(c.c1.x, c.c1.y, c.c2.x, c.c2.y, c.e.x, c.e.y);
          ctx.stroke();
        });
      });
    }
  }

  cvs.listen("mousedown", md);
  cvs.listen("mousemove", mm);
  cvs.listen("mouseup", me);
});
