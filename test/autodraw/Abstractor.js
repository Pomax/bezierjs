// Bezier abstraction based on RDP reduced coordinates
class Abstractor {
  constructor(coords) {
    this.coords = coords;
  }

  abstract() {
    var list = abstractor.split(coords);
    return list.map(list => this.convert(list));
  }

  // create a virtual start and end point for CR-splining
  prep(c,m,p5,p6,dx,dy) {
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
  convert(c,p1,p2,p3,p4,dx,dy,cx1,cy1,cx2,cy2,p5,ci) {
    var l = c.length, i, curves=[], f=1;
    c = this.prep(c);
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

  // positive or negative winding triangle?
  getTriangleWinding(p1,p2,p3) {
    if(p2 && p3) {
      p1 = this.getAngle(p1,p2,p3);
    }
    return p1 > 0 ? 1 : -1;
  }

  // split the list of coordinates when we see a kink or discontinuity
  split(c) {
    var threshold = Math.PI/3;
    var list = [], i, s, p0, p1, p2, p3, a, b, t = Math.PI/2;
    for(s=0,i=0; i<c.length-2; i++) {
      p1 = c[i]; p2 = c[i+1]; p3 = c[i+2];
      // if the forward angle is not ina 45 degree cone wrt the
      // incoming direction, we're going to treat it as "this is a cut"
      a = this.getAngle(p1,p2,p3);
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
};
