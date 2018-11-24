var Bezier = require("../lib/bezier");
var utils = Bezier.getUtils();
var assert = require("chai").use(require("chai-stats")).assert;


// plain and SVG quadratic check
(function testQuadratic() {
  [
    new Bezier(0,0, .5,1, 1,0),
    Bezier.SVGtoBeziers("M 0 0 Q 0.5 1 1 0").curve(0)
  ].forEach(function(b) {
    assert.equal(b.toString(), "[0/0, 0.5/1, 1/0]");
    assert.almostEqual(b.length(), 1.4789428575453212);
    assert.deepAlmostEqual(b.dpoints, [
      [{x:1, y:2}, {x:1, y:-2}],
      [{x:0, y:-4}]
    ]);

    assert.deepAlmostEqual(b.derivative(0), {x:1, y:2});
    assert.deepAlmostEqual(b.derivative(0.5), {x:1, y:0});
    assert.deepAlmostEqual(b.derivative(1), {x:1, y:-2});

    assert.deepAlmostEqual(b.normal(0), {x:-0.8944271909999159, y:0.4472135954999579});
    assert.deepAlmostEqual(b.normal(0.5), {x:-0, y:1});
    assert.deepAlmostEqual(b.normal(1), {x:0.8944271909999159, y:0.4472135954999579});

    assert.deepAlmostEqual(b.inflections(), {x:[], y:[0.5], values:[0.5]});
    assert.deepAlmostEqual(b.bbox(), {
      x:{min:0, mid:0.5, max:1, size:1},
      y:{min:0, mid:0.25, max:0.5, size:0.5}
    });
  });

  // SVG relative quadratic check
  assert.equal(
    Bezier.SVGtoBeziers("m5 5q.5 1 1 0").curve(0).toString(),
    "[5/5, 5.5/6, 6/5]"
  );
}());

// plain and SVG cubic check
(function testCubic() {
  [
    new Bezier(0,0, 0,1, 1,1, 1,0),
    Bezier.SVGtoBeziers("m 0 0 C 0 1 1 1 1 0").curve(0)
  ].forEach(function(b) {
    assert.equal(b.toString(), "[0/0, 0/1, 1/1, 1/0]");
    assert.almostEqual(b.length(), 2);
    assert.deepAlmostEqual(b.dpoints, [
      [{x:0, y:3}, {x:3, y:0}, {x:0, y:-3}],
      [{x:6, y:-6}, {x:-6, y:-6}],
      [{x:-12, y:0}]
    ]);

    assert.deepAlmostEqual(b.derivative(0), {x:0, y:3});
    assert.deepAlmostEqual(b.derivative(0.5), {x:1.5, y:0});
    assert.deepAlmostEqual(b.derivative(1), {x:0, y:-3});

    assert.deepAlmostEqual(b.normal(0), {x:-1, y:0});
    assert.deepAlmostEqual(b.normal(0.5), {x:-0, y:1});
    assert.deepAlmostEqual(b.normal(1), {x:1, y:0});

    assert.deepAlmostEqual(b.inflections(), {x:[0, 0.5, 1], y:[0.5], values:[0, 0.5, 0.5, 1]});
    assert.deepAlmostEqual(b.bbox(), {
      x:{min:0, mid:0.5, max:1, size:1},
      y:{min:0, mid:0.375, max:0.75, size:0.75}
    });
  });

  // SVG relative cubic check
  assert.equal(
    Bezier.SVGtoBeziers("m1-1c0,1 1,1 1,0").curve(0).toString(),
    "[1/-1, 1/0, 2/0, 2/-1]"
  );
}());

// "line" curves
(function testLinearCurves() {
  [
    new Bezier([0, 0, 100, 100])
  ].forEach(function(b) {
    assert.equal(b.toString(), "[0/0, 100/100]");
    var t5 = b.compute(0.5);
    assert.equal(t5.x, 50);
    assert.equal(t5.y, 50);
  });
}());

// high order curves
(function testHigherOrder() {
  [
    new Bezier([{x:0,y:0}, {x:0,y:1}, {x:1,y:1}, {x:1,y:2}, {x:2,y:2}])
  ].forEach(function(b) {
    assert.equal(b.toString(), "[0/0, 0/1, 1/1, 1/2, 2/2]");
  });

  [
    new Bezier([{x:0,y:0}, {x:0,y:1}, {x:1,y:1}, {x:1,y:2}, {x:2,y:2}, {x:2,y:3}])
  ].forEach(function(b) {
    assert.equal(b.toString(), "[0/0, 0/1, 1/1, 1/2, 2/2, 2/3]");
  });

  [
    new Bezier([{x:0,y:0,z:10}, {x:0,y:1,z:11}, {x:1,y:1,z:12}, {x:1,y:2,z:13}, {x:2,y:2,z:14}, {x:2,y:3,z:15}])
  ].forEach(function(b) {
    assert.equal(b.toString(), "[0/0/10, 0/1/11, 1/1/12, 1/2/13, 2/2/14, 2/3/15]");
    var t5 = b.compute(0.5);
    assert.equal(t5.x, 1);
    assert.equal(t5.y, 1.5);
  });
}());

// Utils hookup?
(function testUtilsHookup() {
  assert.isArray(Bezier.getUtils().Tvalues);
  assert.isFunction(Bezier.getUtils().map);
}());

// test higher order curves, at least for what can be called.
(function testHigherOrder(){
  [
    new Bezier([{x:0,y:0,z:10}, {x:0,y:1,z:11}, {x:1,y:1,z:12}])
  ].forEach(function(b) {
  assert.isArray(b.getUtils().Tvalues);
  assert.isFunction(b.getUtils().map);
  });

  var test_bezier = [0, 1.74, .21, 1.67, .28, 1.32, .28, .86];
  var test_line = { p1: { x: -.56, y: .95}, p2: { x: .57, y: .95 } };
  assert(new Bezier(test_bezier).intersects(test_line).length !== 0);
}());

// test for numerical precision despite rounding errors after the significant digit
(function testPrecision() {
  var p = [
        {x:0, y:1.74},
        {x:0.21, y:1.67},
        {x:0.28, y:1.32},
        {x:0.28, y:0.86}
      ],

      t = 0.9336954111478684,
      mt = 1-t,
      mt2 = mt*mt,
      t2 = t*t,

      a = mt2*mt,
      b = mt2*t*3,
      c = mt*t2*3,
      d = t*t2,

      np = {
        x: a*p[0].x + b*p[1].x + c*p[2].x + d*p[3].x,
        y: a*p[0].y + b*p[1].y + c*p[2].y + d*p[3].y
      },

      my = 0.95,
      MY = 0.95;

  // np.y will be 0.9500000000015 or something similarly roundy-silly

  assert(utils.between(np.y,my,MY) === true, "y inside range, despite IEEE rounding");
}());


// test projecting points onto curves
(function testProjection() {
  var b = new Bezier([0,0, 100,0, 100,100]);
  var projection = b.project({x: 80, y: 20});
  assert(projection.x === 75, "x projectION should be at (75,25)");
  assert(projection.y === 25, "y projectION should be at (75,25)");
}());


// test generating quadratic curves through points
(function testQuadraticFromPoints() {
  var B = {x:75,y:25};
  var pts = [{x:0,y:0}, B, {x:100, y:100}];
  var b = Bezier.quadraticFromPoints(pts[0], pts[1], pts[2]);
  var Bp = b.get(0.5);
  assert(utils.approximately(B.x, Bp.x), "quadratic B and computed B have same x coordinate");
  assert(utils.approximately(B.y, Bp.y), "quadratic B and computed B have same y coordinate");

  var t = 0.25;
  b = Bezier.quadraticFromPoints(pts[0], pts[1], pts[2], t);
  Bp = b.get(t);
  assert(utils.approximately(B.x, Bp.x), "quadratic B and computed B have same x coordinate with t="+t);
  assert(utils.approximately(B.y, Bp.y), "quadratic B and computed B have same y coordinate with t="+t);
}());


// test generating cubic curves through points
(function testCubicFromPoints() {
  var B = {x:200/3,y:100/3};
  var pts = [{x:0,y:0}, B, {x:100, y:100}];
  var b = Bezier.cubicFromPoints(pts[0], pts[1], pts[2]);
  var Bp = b.get(0.5);
  assert(utils.approximately(B.x, Bp.x), "cubic B and computed B have same x coordinate");
  assert(utils.approximately(B.y, Bp.y), "cubic B and computed B have same y coordinate");

  var t = 0.25;
  b = Bezier.cubicFromPoints(pts[0], pts[1], pts[2], t);
  Bp = b.get(t);
  assert(utils.approximately(B.x, Bp.x), "cubic B and computed B have same x coordinate with t="+t);
  assert(utils.approximately(B.y, Bp.y), "cubic B and computed B have same y coordinate with t="+t);
}());

(function testExtrema() {
  var B = new Bezier(330,592, 330,557, 315,522, 315,485);
  var e = B.extrema().values;
  assert(e.length === 3, "Extrema test curve has three extrema");
  assert(e[0] === 0, "Extrema test curve value 1 is zero");
  assert(e[1] === 0.5, "Extrema test curve value 2 is one half");
  assert(e[2] === 1, "Extrema test curve value 3 is one");
}());

(function testArcEndvalue() {
  var B = new Bezier([25.308000000000003,10.260000000000001,25.848000000000002,10.728000000000001,25.848000000000002,11.304000000000002]);
  var arcs = B.arcs(0.0012143080752705958)
  var arc = arcs[1];
  assert(arc.interval.end === 1, "final arc interval is capped at t=1.0");
}());

(function testSVG() {
  var circle="M138.406787,51.9034859 C138.406787,51.9034859 74.8695308,-25.4868408 21.9358155,9.81888414 C-30.9978998,45.1246091 32.5393566,122.514936 32.5393566,122.514936";
  var circleSegments = Bezier.SVGtoBeziers(circle);
  assert(circleSegments.curves.length === 2, "two sections to the circle");

  var path="M133.38,286.76 C59.7162601,286.76 0,227.04374 0,153.38 C0,79.7162601 59.7162601,20 133.38,20 C207.04374,20 266.76,79.7162601 266.76,153.38 C266.76,227.04374 207.04374,286.76 133.38,286.76 Z";
  var pathSegments = Bezier.SVGtoBeziers(path);
  assert(pathSegments.curves.length === 4, "four sections to the path");
}());

(function testIntersection() {
  var b = new Bezier(76,250, 77,150, 220,50);
  var l = {p1: { x:13, y:140 }, p2: { x:213, y:140 }};
  var i = b.intersects(l);
  assert(i.length === 1, "curve intersects horizontal");
  assert(i[0] === 0.55, "curve intersects horizontal");
}());

(function testCurvature() {
  var b = new Bezier(60,190, 5,5, 110,250, 175,15);

  for(var t=0; t<=1; t+=0.01) {
    let r = b.curvature(t);
    // mostly this just needs to run. Not be "correct" for now.
  }

  b = new Bezier({x:60,y:190,z:1}, {x:5,y:5,z:2}, {x:110,y:250,z:3});

  for(var t=0; t<=1; t+=0.01) {
    let r = b.curvature(t);
    // mostly this just needs to run. Not be "correct" for now.
  }
}());
