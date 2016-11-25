module.exports = function(Bezier) {
  'use strict';

  // math-inlining.
  var abs = Math.abs,
      cos = Math.cos,
      sin = Math.sin,
      acos = Math.acos,
      atan2 = Math.atan2,
      sqrt = Math.sqrt,
      pow = Math.pow,
      // cube root function yielding real roots
      crt = function(v) { return (v<0) ? -pow(-v,1/3) : pow(v,1/3); },
      // trig constants
      pi = Math.PI,
      tau = 2*pi,
      quart = pi/2,
      // float precision significant decimal
      epsilon = 0.000001,
      nMax = Number.MAX_SAFE_INTEGER,
      nMin = Number.MIN_SAFE_INTEGER;

  var utils = {};

  utils.makeline = function(p1, p2) {
    var x1 = p1.x, y1 = p1.y, x2 = p2.x, y2 = p2.y, dx = (x2-x1)/3, dy = (y2-y1)/3;
    return [
      { x: x1, y: y1 },
      { x: x1 + dx, y: y1 + dy },
      { x: x1+2*dx, y: y1+2*dy },
      { x: x2, y: y2 },
    ];
  };

  utils.findbbox = function(sections) {
    var xMin=nMax,yMin=nMax,xMax=nMin,yMax=nMin;
    sections.forEach(function(s) {
      var bbox = Bezier.getBbox(s);
      if(xMin > bbox.x.min) xMin = bbox.x.min;
      if(yMin > bbox.y.min) yMin = bbox.y.min;
      if(xMax < bbox.x.max) xMax = bbox.x.max;
      if(yMax < bbox.y.max) yMax = bbox.y.max;
    });
    return {
      x: { min: xMin, mid:(xMin+xMax)/2, max: xMax, size:xMax-xMin },
      y: { min: yMin, mid:(yMin+yMax)/2, max: yMax, size:yMax-yMin }
    };
  };

  utils.shapeintersections = function(s1, bbox1, s2, bbox2, curveIntersectionThreshold) {
    if(!utils.bboxoverlap(bbox1, bbox2)) return [];
    var intersections = [];
    var a1 = [s1.startcap, s1.forward, s1.back, s1.endcap];
    var a2 = [s2.startcap, s2.forward, s2.back, s2.endcap];
    a1.forEach(function(l1) {
      if(l1[0].virtual) return;
      a2.forEach(function(l2) {
        if(l2[0].virtual) return;
        var iss = Bezier.intersects(l1, l2, curveIntersectionThreshold);
        if(iss.length>0) {
          iss.c1 = l1;
          iss.c2 = l2;
          iss.s1 = s1;
          iss.s2 = s2;
          intersections.push(iss);
        }
      });
    });
    return intersections;
  };

  utils.makeshape = function(forward, back, curveIntersectionThreshold) {
    var bpl = back.length;
    var fpl = forward.length;
    var start  = utils.makeline(back[bpl-1], forward[0]);
    var end    = utils.makeline(forward[fpl-1], back[0]);
    var shape  = {
      startcap: start,
      forward: forward,
      back: back,
      endcap: end,
      bbox: utils.findbbox([start, forward, back, end])
    };
    shape.intersections = function(s2) {
      return utils.shapeintersections(shape,shape.bbox,s2,s2.bbox, curveIntersectionThreshold);
    };
    return shape;
  };

  utils.getminmax = function(points, d, list) {
    if(!list) return { min:0, max:0 };
    var min=nMax, max=nMin,t,c;
    if(list.indexOf(0)===-1) { list = [0].concat(list); }
    if(list.indexOf(1)===-1) { list.push(1); }
    for(var i=0,len=list.length; i<len; i++) {
      t = list[i];
      c = Bezier.compute(points, t);
      if(c[d] < min) { min = c[d]; }
      if(c[d] > max) { max = c[d]; }
    }
    return { min:min, mid:(min+max)/2, max:max, size:max-min };
  };

  utils.pairiteration = function(c1, c2, curveIntersectionThreshold) {
    var c1b = Bezier.getBbox(c1),
        c2b = Bezier.getBbox(c2),
        r = 100000,
        threshold = curveIntersectionThreshold || 0.5;
    if(c1b.x.size + c1b.y.size < threshold && c2b.x.size + c2b.y.size < threshold) {
      return [
        ((r * ((c1[0]._t1 || 0)+(c1[0]._t2 || 1))/2)|0)/r +
        "/" +
        ((r * ((c2[0]._t1 || 0)+(c2[0]._t2 || 1))/2)|0)/r
      ];
    }
    var cc1 = Bezier.split(c1, 0.5),
        cc2 = Bezier.split(c2, 0.5),
        pairs = [
          {left: cc1.left, right: cc2.left },
          {left: cc1.left, right: cc2.right },
          {left: cc1.right, right: cc2.right },
          {left: cc1.right, right: cc2.left }];
    pairs = pairs.filter(function(pair) {
      return utils.bboxoverlap(Bezier.getBbox(pair.left), Bezier.getBbox(pair.right));
    });
    var results = [];
    if(pairs.length === 0) return results;
    pairs.forEach(function(pair) {
      results = results.concat(
        utils.pairiteration(pair.left, pair.right, threshold)
      );
    });
    results = results.filter(function(v,i) {
      return results.indexOf(v) === i;
    });
    return results;
  };

  return utils;
};