// Ramer–Douglas–Peucker simplification
class RDP {
  constructor(threshold) {
    this.threshold = threshold || 2.5;
  }

  runRDP(coords) {
    coords = coords.slice();
    this.markAngles(coords);
    if(coords.length===2) {
      coords[0].keep = true;
      coords[1].keep = true;
      return coords;
    }
    coords = this.reducePoints(coords)
    // this.mergeClosePoints(coords);
    this.markAngles(coords);
    return coords;
  }

  mergeClosePoints(coords) {
    for(let i=0; i<coords.length-2; i++) {
      let c = coords[i];
      let n = coords[i+1];
      if (c.acute) continue;
      if (n.acute) continue;
      if (dist(c,n) < 10) {
        c.x = (c.x + n.x) / 2;
        c.y = (c.y + n.y) / 2;
        coords.splice(i+1, 1);
      }
    }
  }

  markAngles(coords) {
    let a = coords[0],
        b = coords[1],
        c = coords[2],
        angle;
    for(let i=3, e=coords.length-1; i<e; i++) {
      angle = abs(getAngle(a,b,c));
      if (angle < 1.8) {
        // TODO: this also depends on the fidelity of the curve. The closer
        //       points are, the more neighbours play a role in determining
        //       whether this is true acuteness or not.
        b.acute = true;
      }
      a = b;
      b = c;
      c = coords[i];
    }
  }

  reducePoints(coords) {
    var l = coords.length-1,
        s = 0,
        e = l,
        v = coords[s],
        w = coords[e],
        md = 0,
        mdi = 0,
        p,i,d;

    for(i=s+1; i<e-1; i++) {
      p = coords[i];
      d = distToSegment(p, v, w);
      if(d>md) { md=d; mdi=i; }
    }

    // if a transition is detected, process each set separately
    if(md > this.threshold) {
      this.runRDP(coords.slice(s,mdi+1))
      this.runRDP(coords.slice(mdi));
    } else {
      v.keep = true;
      w.keep = true;
    }

    // filter out all unmarked coordinates
    coords = coords.filter(function(c) { return c.keep; });

    return coords;
  }
}

var rdp = new RDP();
