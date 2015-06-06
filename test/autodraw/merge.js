
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