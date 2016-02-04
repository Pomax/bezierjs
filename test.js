var Bezier = require("./lib");
var assert = require("chai").use(require("chai-stats")).assert;

// plain and SVG quadratic check
[
  new Bezier(0,0, .5,1, 1,0),
  Bezier.fromSVG("M 0 0 Q 0.5 1 1 0")
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
  Bezier.fromSVG("5 5c.5 1 1 0").toString(),
  "[5/5, 5.5/6, 6/5]"
);

// plain and SVG cubic check
[
  new Bezier(0,0, 0,1, 1,1, 1,0),
  Bezier.fromSVG("m 0 0 C 0 1 1 1 1 0")
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
  Bezier.fromSVG("m1-1c0,1 1,1 1,0").toString(),
  "[1/-1, 1/0, 2/0, 2/-1]"
);


// "line" curves
[
  new Bezier([0, 0, 100, 100])
].forEach(function(b) {
  assert.equal(b.toString(), "[0/0, 100/100]");
  var t5 = b.compute(0.5);
  assert.equal(t5.x, 50);
  assert.equal(t5.y, 50);
});

// high order curves
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

// Utils hookup?
assert.isArray(Bezier.getUtils().Tvalues);
assert.isFunction(Bezier.getUtils().map);

[
  new Bezier([{x:0,y:0,z:10}, {x:0,y:1,z:11}, {x:1,y:1,z:12}])
].forEach(function(b) {
assert.isArray(b.getUtils().Tvalues);
assert.isFunction(b.getUtils().map);
});

var test_bezier = [0, 1.74, .21, 1.67, .28, 1.32, .28, .86];
var test_line = { p1: { x: -.56, y: .95}, p2: { x: .57, y: .95 } };
assert(new Bezier(test_bezier).intersects(test_line).length !== 0);




