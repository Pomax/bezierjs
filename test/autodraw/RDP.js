// Ramer–Douglas–Peucker simplification
var RDP = function(threshold) {
  this.threshold = threshold || 2.5;
};

RDP.prototype = {
  runRDP: function(coords) {
    coords = coords.slice();
    if(coords.length===2) {
      coords[0].keep = true;
      coords[1].keep = true;
      return coords;
    }
    return this.reducePoints(coords);
  },

  reducePoints: function(coords) {
    var l = coords.length-1,
        s = 0,
        e = l,
        v = coords[s],
        w = coords[e],
        md = 0,
        mdi = 0,
        t = this.threshold,
        p,i,d;

    for(i=s+1; i<e-1; i++) {
      p = coords[i];
      d = distToSegment(p, v, w);
      if(d>md) { md=d; mdi=i; }
    }

    // if a transition is detected, process each set separately
    if(md > t) {
      this.runRDP(coords.slice(s,mdi+1))
      this.runRDP(coords.slice(mdi));
    } else {
      v.keep = true;
      w.keep = true;
    }

    // filter out all unmarked coordinates
    return coords.filter(function(c) { return c.keep; });
  }
};

var rdp = new RDP();

if(typeof module !== "undefined") {
  module.exports = rdp;
}
