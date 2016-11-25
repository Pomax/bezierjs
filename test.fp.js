var Bezier = require('./index.js');
var utils = Bezier.getUtils();
var BezierFP = require('./index.fp.js');
var utilsFP = BezierFP.getUtils();
var assert = require("chai").use(require("chai-stats")).assert;
var deepFreeze = require('deep-freeze');

(function testOrder() {
  var quad = [{x: 0, y: 0}, {x: 1, y: 1}, {x: 2, y: 2}];
  var cub = [{x: 0, y: 0}, {x: 1, y: 1}, {x: 2, y: 2}, {x: 3, y: 3}];

  deepFreeze(quad);
  deepFreeze(cub);

  assert.equal(BezierFP.order(quad), 2);
  assert.equal(BezierFP.order(cub), 3);
}());

(function testIs3d() {
  var quad2d = [{x: 0, y: 0}, {x: 1, y: 1}, {x: 2, y: 2}];
  var quad3d = [{x: 0, y: 0, z: 0}, {x: 1, y: 1, z: 1}, {x: 2, y: 2, z: 2}];

  deepFreeze(quad2d);
  deepFreeze(quad3d);

  assert.equal(BezierFP.is3d(quad2d), false);
  assert.equal(BezierFP.is3d(quad3d), true);
}());

(function testDims() {
  var quad2d = [{x: 0, y: 0}, {x: 1, y: 1}, {x: 2, y: 2}];
  // The first point of the curve can be used to store additional info on the curve
  var quad2dBis = [{x: 0, y: 0, virtual: true, _t1: 0, _t2: 1}, {x: 1, y: 1}, {x: 2, y: 2}];
  var quad3d = [{x: 0, y: 0, z: 0}, {x: 1, y: 1, z: 1}, {x: 2, y: 2, z: 2}];
  var quad3dBis = [{x: 0, y: 0, z: 0, virtual: true, _t1: 0, _t2: 1}, {x: 1, y: 1, z: 1}, {x: 2, y: 2, z: 2}];

  deepFreeze(quad2d);
  deepFreeze(quad2dBis);
  deepFreeze(quad3d);
  deepFreeze(quad3dBis);

  assert.deepEqual(BezierFP.dims(quad2d), ['x','y']);
  assert.deepEqual(BezierFP.dims(quad2dBis), ['x','y']);
  assert.deepEqual(BezierFP.dims(quad3d), ['x','y','z']);
  assert.deepEqual(BezierFP.dims(quad3dBis), ['x','y','z']);
}());

(function testDimlen() {
  var quad2d = [{x: 0, y: 0}, {x: 1, y: 1}, {x: 2, y: 2}];
  // The first point of the curve can be used to store additional info on the curve
  var quad2dBis = [{x: 0, y: 0, virtual: true, _t1: 0, _t2: 1}, {x: 1, y: 1}, {x: 2, y: 2}];
  var quad3d = [{x: 0, y: 0, z: 0}, {x: 1, y: 1, z: 1}, {x: 2, y: 2, z: 2}];
  var quad3dBis = [{x: 0, y: 0, z: 0, virtual: true, _t1: 0, _t2: 1}, {x: 1, y: 1, z: 1}, {x: 2, y: 2, z: 2}];

  deepFreeze(quad2d);
  deepFreeze(quad2dBis);
  deepFreeze(quad3d);
  deepFreeze(quad3dBis);

  assert.deepEqual(BezierFP.dimlen(quad2d), 2);
  assert.deepEqual(BezierFP.dimlen(quad2dBis), 2);
  assert.deepEqual(BezierFP.dimlen(quad3d), 3);
  assert.deepEqual(BezierFP.dimlen(quad3dBis), 3);
}());

(function testToSVG() {
  var quad = [{x: 0, y: 0}, {x: 1, y: 1}, {x: 2, y: 2}];
  var cub = [{x: 0, y: 0}, {x: 1, y: 1}, {x: 2, y: 2}, {x: 3, y: 3}];

  deepFreeze(quad);
  deepFreeze(cub);

  assert.equal(BezierFP.toSVG(quad), 'M 0 0 Q 1 1 2 2');
  assert.equal(BezierFP.toSVG(cub), 'M 0 0 C 1 1 2 2 3 3');
}());

(function testInvert() {
  var quad = [{x: 0, y: 0, _t1: 0.2, _t2: 0.7, extra: 'info'}, {x: 1, y: 1}, {x: 2, y: 2}];
  var cub = [{x: 0, y: 0, _t1: 0.2, _t2: 0.7, extra: 'info'}, {x: 1, y: 1}, {x: 2, y: 2}, {x: 3, y: 3}];

  deepFreeze(quad);
  deepFreeze(cub);

  assert.deepEqual(BezierFP.invert(quad), [{x: 2, y: 2, _t2: 1 - 0.2, _t1: 1 - 0.7, extra: 'info'}, {x: 1, y: 1}, {x: 0, y: 0}]);
  assert.deepEqual(BezierFP.invert(cub), [{x: 3, y: 3, _t2: 1 - 0.2, _t1: 1 - 0.7, extra: 'info'}, {x: 2, y: 2}, {x: 1, y: 1}, {x: 0, y: 0}]);
}());

/*
 * The following tests only verify two things:
 * - That results of BezierFP are consistent with results from Bezier.
 * - That methods of BezierFP never mutate parameters.
 */

(function testDerivativePoints() {
  var bQuad = new Bezier(150,40 , 80,30 , 105,150);
  var quad = [{x: 150, y: 40}, {x: 80, y: 30}, {x: 105, y: 150}];

  deepFreeze(quad);

  assert.deepEqual(bQuad.dpoints, BezierFP.derivativePoints(quad));
}());

(function testIsClockwise() {
  var bQuad = new Bezier(150,40 , 80,30 , 105,150);
  var quad = [{x: 150, y: 40}, {x: 80, y: 30}, {x: 105, y: 150}];

  deepFreeze(quad);

  bQuad.computedirection();
  assert.equal(bQuad.clockwise, BezierFP.isClockwise(quad));
}());

(function testDerivative() {
  var bQuad = new Bezier(150,40 , 80,30 , 105,150);
  var quad = [{x: 150, y: 40}, {x: 80, y: 30}, {x: 105, y: 150}];
  var bCub = new Bezier(100,25 , 10,90 , 110,100 , 150,195);
  var cub = [{x: 100, y: 25}, {x: 10, y: 90}, {x: 110, y: 100}, { x: 150, y: 195}];

  deepFreeze(quad);
  deepFreeze(cub);

  assert.deepEqual(bQuad.derivative(0.5), BezierFP.derivative(quad, 0.5));
  assert.deepEqual(bCub.derivative(0.5), BezierFP.derivative(cub, 0.5));
}());

(function testLength() {
  var bCub = new Bezier(100,25 , 10,90 , 110,100 , 150,195);
  var cub = [{x: 100, y: 25}, {x: 10, y: 90}, {x: 110, y: 100}, { x: 150, y: 195}];

  deepFreeze(cub);

  assert.equal(bCub.length(), BezierFP.length(cub));
}());

(function testCompute() {
  var bQuad = new Bezier(150,40 , 80,30 , 105,150);
  var quad = [{x: 150, y: 40}, {x: 80, y: 30}, {x: 105, y: 150}];
  var bCub = new Bezier(100,25 , 10,90 , 110,100 , 150,195);
  var cub = [{x: 100, y: 25}, {x: 10, y: 90}, {x: 110, y: 100}, { x: 150, y: 195}];

  deepFreeze(quad);
  deepFreeze(cub);

  assert.deepEqual(bQuad.compute(0.3), BezierFP.compute(quad, 0.3));
  assert.deepEqual(bCub.compute(0.3), BezierFP.compute(cub, 0.3));
}());

(function testLUT() {
  var bCub = new Bezier(100,25 , 10,90 , 110,100 , 150,195);
  var cub = [{x: 100, y: 25}, {x: 10, y: 90}, {x: 110, y: 100}, { x: 150, y: 195}];

  deepFreeze(cub);

  assert.deepEqual(bCub.getLUT(), BezierFP.LUT(cub));
}());

(function testCrosses() {
  var bCub = new Bezier(100,25 , 10,90 , 110,100 , 150,195);
  var cub = [{x: 100, y: 25}, {x: 10, y: 90}, {x: 110, y: 100}, { x: 150, y: 195}];
  var pointOn = {x: 63, y: 72};
  var pointOut = {x: 20, y: 20};

  deepFreeze(cub);
  deepFreeze(pointOn);
  deepFreeze(pointOut);

  assert.equal(bCub.on(pointOn), BezierFP.crosses(cub, pointOn));
  assert.equal(bCub.on(pointOut), BezierFP.crosses(cub, pointOut));
}());

(function testProject() {
  var bCub = new Bezier(100,25 , 10,90 , 110,100 , 150,195);
  var cub = [{x: 100, y: 25}, {x: 10, y: 90}, {x: 110, y: 100}, { x: 150, y: 195}];
  var point = {x: 125, y: 110};

  deepFreeze(cub);
  deepFreeze(point);

  assert.deepEqual(bCub.project(point), BezierFP.project(cub, point));
}());

(function testRaise() {
  var bQuad = new Bezier(150,40 , 80,30 , 105,150);
  var quad = [{x: 150, y: 40}, {x: 80, y: 30}, {x: 105, y: 150}];

  deepFreeze(quad);

  assert.deepEqual(bQuad.raise().points, BezierFP.raise(quad));
}());

(function testInflections() {
  var bQuad = new Bezier(150,40 , 80,30 , 105,150);
  var quad = [{x: 150, y: 40}, {x: 80, y: 30}, {x: 105, y: 150}];
  var bCub = new Bezier(100,25 , 10,90 , 110,100 , 150,195);
  var cub = [{x: 100, y: 25}, {x: 10, y: 90}, {x: 110, y: 100}, { x: 150, y: 195}];

  deepFreeze(quad);
  deepFreeze(cub);

  assert.deepEqual(bQuad.inflections(), BezierFP.inflections(quad));
  assert.deepEqual(bCub.inflections(), BezierFP.inflections(cub));
}());

(function testNormal() {
  var bCub = new Bezier(100,25 , 10,90 , 110,100 , 150,195);
  var cub = [{x: 100, y: 25}, {x: 10, y: 90}, {x: 110, y: 100}, { x: 150, y: 195}];

  deepFreeze(cub);

  assert.deepEqual(bCub.normal(0.5), BezierFP.normal(cub, 0.5));

  // TODO: test 3d
}());

(function testHull() {
  var bCub = new Bezier(100,25 , 10,90 , 110,100 , 150,195);
  var cub = [{x: 100, y: 25}, {x: 10, y: 90}, {x: 110, y: 100}, { x: 150, y: 195}];

  deepFreeze(cub);

  assert.deepEqual(bCub.hull(0.5), BezierFP.hull(cub, 0.5));
}());

(function testSplit() {

}());
