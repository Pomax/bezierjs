/**
 * Utility functions for doing Bezier-related things
 */
var BezierUtils = {
  map: function(v, ds,de, ts,te) {
    var d1 = de-ds, d2 = te-ts, v2 =  v-ds, r = v2/d1;
    return ts + d2*r;
  },
  copy: function(obj) {
    return JSON.parse(JSON.stringify(obj));
  },
  lli: function(v1, v2) {
    var x1=v1.c.x, y1=v1.c.y,
        x2=v1.x, y2=v1.y,
        x3=v2.c.x,y3=v2.c.y,
        x4=v2.x,y4=v2.y,
        nx=(x1*y2-y1*x2)*(x3-x4)-(x1-x2)*(x3*y4-y3*x4),
        ny=(x1*y2-y1*x2)*(y3-y4)-(y1-y2)*(x3*y4-y3*x4),
        d=(x1-x2)*(y3-y4)-(y1-y2)*(x3-x4);
    if(d==0) { return false; }
    return { x: nx/d, y: ny/d, z: 0 };
  },
  computeDim: function(p,v,t) {
    p = [p[0][v], p[1][v], p[2][v], p[3][v]];
    var mt = 1-t,
        t2 = t*t,
        mt2 = mt*mt,
        a = mt2*mt,
        b = mt2*t*3,
        c = mt*t2*3,
        d = t*t2;
    return a*p[0] + b*p[1] + c*p[2] + d*p[3];
  },
  splitDim: function(p,v,z) {
    // see http://pomax.github.io/bezierinfo/#matrixsplit
    p = [p[0][v], p[1][v], p[2][v], p[3][v]];
    var zm = z-1,
        z2 = z*z,
        zm2 = zm*zm,
        z3 = z2*z,
        zm3 = zm2*zm;
    var p1 = p[0],
        p2 = z*p[1] - zm*p[0],
        p3 = z2*p[2] - 2*z*zm*p[1] + zm2*p[0],
        p4 = z3*p[3] - 3*z2*zm*p[2] + 3*z*zm2*p[1]-zm3*p[0],
        p5 = p4,
        p6 = z2*p[3] - 2*z*zm*p[2] + zm2*p[1],
        p7 = z*p[3] - zm*p[2],
        p8 = p[3];
    return [[p1,p2,p3,p4],[p5,p6,p7,p8]];
  },
  getminmax: function(curve, d, list) {
    if(!list) return { min:0, max:0 };
    var min=0xFFFFFFFFFFFFFFFF, max=-min,t,c;
    if(list.indexOf(0)===-1) { list = [0].concat(list); }
    if(list.indexOf(1)===-1) { list.push(1); }
    for(var i=0,len=list.length; i<len; i++) {
      t = list[i];
      c = curve.get(t);
      if(c[d] < min) { min = c[d]; }
      if(c[d] > max) { max = c[d]; }
    }
    return { min:min, mid:(min+max)/2, max:max, size:max-min };
  },
  rootsd1: function(p) {
    var a = 3*(p[1]-p[0]),
        b = 3*(p[2]-p[1]),
        c = 3*(p[3]-p[2]),
        d = a - 2*b + c;
    if(d!==0) {
      var m1 = -Math.sqrt(b*b-a*c),
          m2 = -a+b,
          v1 = -( m1+m2)/d,
          v2 = -(-m1+m2)/d;
      return [v1, v2];
    }
    else if(b!==c && d===0) {
      return [ (2*b-c)/2*(b-c) ];
    }
    return [];
  },
  rootsd2: function(p) {
    var a = 3*(p[1]-p[0]),
        b = 3*(p[2]-p[1]),
        c = 3*(p[3]-p[2]);
    a = 2*(b-a);
    b = 2*(c-b);
    if(a!==b) { return [a/(a-b)] }
    return [];
  },
  bboxoverlap: function(b1,b2) {
    var dims=['x','y'],len=dims.length,i,dim,l,t,d
    for(i=0; i<len; i++) {
      dim = dims[i];
      l = b1[dim].mid;
      t = b2[dim].mid;
      d = (b1[dim].size + b2[dim].size)/2;
      if(Math.abs(l-t) >= d) return false;
    }
    return true;
  },
  pairiteration: function(c1,c2) {
    var c1b = c1.bbox(),
        c2b = c2.bbox(),
        r = 100000;
    if(c1b.x.size + c1b.y.size < 0.9 && c2b.x.size + c2b.y.size < 0.9) {
      return [ ((r * (c1._t1+c1._t2)/2)|0)/r + "/" + ((r * (c2._t1+c2._t2)/2)|0)/r ];
    }
    var cc1 = c1.split(0.5),
        cc2 = c2.split(0.5),
        pairs = [
          {left: cc1[0], right: cc2[0] },
          {left: cc1[0], right: cc2[1] },
          {left: cc1[1], right: cc2[1] },
          {left: cc1[1], right: cc2[0] }];
    pairs = pairs.filter(function(pair) {
      return BezierUtils.bboxoverlap(pair.left.bbox(),pair.right.bbox());
    });
    var results = [];
    if(pairs.length === 0) return results;
    pairs.forEach(function(pair) {
      results = results.concat(
        BezierUtils.pairiteration(pair.left, pair.right)
      );
    })
    results = results.filter(function(v,i) {
      return results.indexOf(v) === i;
    });
    return results;
  }
};
