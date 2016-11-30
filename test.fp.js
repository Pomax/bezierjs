var Bezier = require('./index.js');
var utils = Bezier.getUtils();
var BezierFP = require('./index.fp.js');
var utilsFP = BezierFP.getUtils();
var assert = require("chai").use(require("chai-stats")).assert;
var deepFreeze = require('deep-freeze');

/*
 * ## Test bezier.fp.js
 * Most of the units only test two things:
 * - That results of BezierFP are consistent with results from Bezier.
 * - That methods of BezierFP never mutate parameters.
 */

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
  assert.equal(BezierFP.isClockwise(quad), bQuad.clockwise);
}());

(function testIsLinear() {
  var cub = [{x: 0, y: 0}, {x: 25, y: 26}, {x: 74, y: 75}, { x: 100, y: 100}];

  deepFreeze(cub);

  assert.equal(BezierFP.isLinear(cub));
}());

(function testReverse() {
  var quad = [{x: 0, y: 0, _t1: 0.2, _t2: 0.7, extra: 'info'}, {x: 1, y: 1}, {x: 2, y: 2}];
  var cub = [{x: 0, y: 0, _t1: 0.2, _t2: 0.7, extra: 'info'}, {x: 1, y: 1}, {x: 2, y: 2}, {x: 3, y: 3}];

  deepFreeze(quad);
  deepFreeze(cub);

  assert.deepEqual(BezierFP.reverse(quad), [{x: 2, y: 2, _t2: 1 - 0.2, _t1: 1 - 0.7, extra: 'info'}, {x: 1, y: 1}, {x: 0, y: 0}]);
  assert.deepEqual(BezierFP.reverse(cub), [{x: 3, y: 3, _t2: 1 - 0.2, _t1: 1 - 0.7, extra: 'info'}, {x: 2, y: 2}, {x: 1, y: 1}, {x: 0, y: 0}]);
}());

(function testLength() {
  var bCub = new Bezier(100,25 , 10,90 , 110,100 , 150,195);
  var cub = [{x: 100, y: 25}, {x: 10, y: 90}, {x: 110, y: 100}, { x: 150, y: 195}];

  deepFreeze(cub);

  assert.equal(BezierFP.length(cub), bCub.length());
}());

(function testLUT() {
  var bCub = new Bezier(100,25 , 10,90 , 110,100 , 150,195);
  var cub = [{x: 100, y: 25}, {x: 10, y: 90}, {x: 110, y: 100}, { x: 150, y: 195}];

  deepFreeze(cub);

  assert.deepEqual(BezierFP.LUT(cub), bCub.getLUT());
}());

(function testCrosses() {
  var bCub = new Bezier(100,25 , 10,90 , 110,100 , 150,195);
  var cub = [{x: 100, y: 25}, {x: 10, y: 90}, {x: 110, y: 100}, { x: 150, y: 195}];
  var pointOn = {x: 63, y: 72};
  var pointOut = {x: 20, y: 20};

  deepFreeze(cub);
  deepFreeze(pointOn);
  deepFreeze(pointOut);

  assert.equal(BezierFP.crosses(cub, pointOn), bCub.on(pointOn));
  assert.equal(BezierFP.crosses(cub, pointOut), bCub.on(pointOut));
}());

(function testProject() {
  var bCub = new Bezier(100,25 , 10,90 , 110,100 , 150,195);
  var cub = [{x: 100, y: 25}, {x: 10, y: 90}, {x: 110, y: 100}, { x: 150, y: 195}];
  var point = {x: 125, y: 110};

  deepFreeze(cub);
  deepFreeze(point);

  assert.deepEqual(BezierFP.project(cub, point), bCub.project(point));
}());

(function testCompute() {
  var bQuad = new Bezier(150,40 , 80,30 , 105,150);
  var quad = [{x: 150, y: 40}, {x: 80, y: 30}, {x: 105, y: 150}];
  var bCub = new Bezier(100,25 , 10,90 , 110,100 , 150,195);
  var cub = [{x: 100, y: 25}, {x: 10, y: 90}, {x: 110, y: 100}, { x: 150, y: 195}];

  deepFreeze(quad);
  deepFreeze(cub);

  assert.deepEqual(BezierFP.compute(quad, 0.3), bQuad.compute(0.3));
  assert.deepEqual(BezierFP.compute(cub, 0.3), bCub.compute(0.3));
}());

(function testRaise() {
  var bQuad = new Bezier(150,40 , 80,30 , 105,150);
  var quad = [{x: 150, y: 40}, {x: 80, y: 30}, {x: 105, y: 150}];

  deepFreeze(quad);

  assert.deepEqual(BezierFP.raise(quad), bQuad.raise().points);
}());

(function testDerivative() {
  var bQuad = new Bezier(150,40 , 80,30 , 105,150);
  var quad = [{x: 150, y: 40}, {x: 80, y: 30}, {x: 105, y: 150}];
  var bCub = new Bezier(100,25 , 10,90 , 110,100 , 150,195);
  var cub = [{x: 100, y: 25}, {x: 10, y: 90}, {x: 110, y: 100}, { x: 150, y: 195}];

  deepFreeze(quad);
  deepFreeze(cub);

  assert.deepEqual(BezierFP.derivative(quad, 0.5), bQuad.derivative(0.5));
  assert.deepEqual(BezierFP.derivative(cub, 0.5), bCub.derivative(0.5));
}());

(function testInflections() {
  var bQuad = new Bezier(150,40 , 80,30 , 105,150);
  var quad = [{x: 150, y: 40}, {x: 80, y: 30}, {x: 105, y: 150}];
  var bCub = new Bezier(100,25 , 10,90 , 110,100 , 150,195);
  var cub = [{x: 100, y: 25}, {x: 10, y: 90}, {x: 110, y: 100}, { x: 150, y: 195}];

  deepFreeze(quad);
  deepFreeze(cub);

  assert.deepEqual(BezierFP.inflections(quad), bQuad.inflections());
  assert.deepEqual(BezierFP.inflections(cub), bCub.inflections());
}());

(function testNormal() {
  var bCub = new Bezier(100,25 , 10,90 , 110,100 , 150,195);
  var cub = [{x: 100, y: 25}, {x: 10, y: 90}, {x: 110, y: 100}, { x: 150, y: 195}];

  deepFreeze(cub);

  assert.deepEqual(BezierFP.normal(cub, 0.5), bCub.normal(0.5));

  // TODO: test 3d
}());

(function testHull() {
  var bCub = new Bezier(100,25 , 10,90 , 110,100 , 150,195);
  var cub = [{x: 100, y: 25}, {x: 10, y: 90}, {x: 110, y: 100}, { x: 150, y: 195}];

  deepFreeze(cub);

  assert.deepEqual(BezierFP.hull(cub, 0.5), bCub.hull(0.5));
}());

(function testSplit() {
  var bCub = new Bezier(100,25 , 10,90 , 110,100 , 150,195);
  var cub = [{x: 100, y: 25}, {x: 10, y: 90}, {x: 110, y: 100}, { x: 150, y: 195}];

  deepFreeze(cub);

  bCubSplit1 = bCub.split(0.5);
  cubSplit1 = BezierFP.split(cub, 0.5);
  bCubSplit2 = bCub.split(0.2, 0.7);
  cubSplit2 = BezierFP.split(cub, 0.2, 0.7);

  assert.equal(cubSplit1.left[0]._t1, bCubSplit1.left._t1);
  assert.equal(cubSplit1.left[0]._t2, bCubSplit1.left._t2);
  assert.equal(cubSplit1.right[0]._t1, bCubSplit1.right._t1);
  assert.equal(cubSplit1.right[0]._t2, bCubSplit1.right._t2);
  assert.equal(cubSplit2[0]._t1, bCubSplit2._t1);
  assert.equal(cubSplit2[0]._t2, bCubSplit2._t2);

  delete cubSplit1.left[0]._t1;
  delete cubSplit1.left[0]._t2;
  delete cubSplit1.right[0]._t1;
  delete cubSplit1.right[0]._t2;
  delete cubSplit2[0]._t1;
  delete cubSplit2[0]._t2;

  assert.deepEqual(cubSplit1.left, bCubSplit1.left.points);
  assert.deepEqual(cubSplit1.right, bCubSplit1.right.points);
  assert.deepEqual(cubSplit1.span, bCubSplit1.span);
  assert.deepEqual(cubSplit2, bCubSplit2.points);
}());

(function testExtrema() {
  var bCub = new Bezier(100,25 , 10,90 , 110,100 , 150,195);
  var cub = [{x: 100, y: 25}, {x: 10, y: 90}, {x: 110, y: 100}, { x: 150, y: 195}];

  deepFreeze(cub);

  assert.deepEqual(BezierFP.extrema(cub), bCub.extrema());
}());

(function testBbox() {
  var bCub = new Bezier(100,25 , 10,90 , 110,100 , 150,195);
  var cub = [{x: 100, y: 25}, {x: 10, y: 90}, {x: 110, y: 100}, { x: 150, y: 195}];

  deepFreeze(cub);

  assert.deepEqual(BezierFP.bbox(cub), bCub.bbox());
}());

(function testOverlaps() {

}());

(function testOffset() {

}());

(function testIsSimple() {
// TODO test
}());

(function testReduce() {

}());

(function testScale() {

}());

(function testOutline() {
  var bCub = new Bezier(150,40 , 80,30 , 105,150);
  var cub = [{x: 150, y: 40}, {x: 80, y: 30}, {x: 105, y: 150}];

  deepFreeze(cub);

  var bCubOutlines = bCub.outline(25);
  var cubOutlines = BezierFP.outline(cub, 25);

  assert.equal(cubOutlines.length, bCubOutlines.curves.length);

  cubOutlines.forEach(function(curve, i) {
    var bCurve = bCubOutlines.curves[i];

    assert.equal(curve[0].virtual, bCurve.virtual);
    // TODO: t1 / t2 asserts

    curve.forEach(function(point, j) {
      delete point._t1;
      delete point._t2;
      delete point.virtual;
    });

    assert.deepEqual(curve, bCurve.points);
  });
}());

(function testOutlineshapes() {
  var bCub = new Bezier(100,25 , 10,90 , 110,100 , 150,195);
  var cub = [{x: 100, y: 25}, {x: 10, y: 90}, {x: 110, y: 100}, { x: 150, y: 195}];

  deepFreeze(cub);

  var bCubOutlines = bCub.outlineshapes(25, 15);
  var cubOutlines = BezierFP.outlineshapes(cub, 25, 15);

  assert.equal(cubOutlines.length, bCubOutlines.length);

  bCubOutlines.forEach(function(shape, shapeId) {
    ['startcap', 'forward', 'back', 'endcap'].forEach(function(key) {
      var bCurve = shape[key];
      var curve = cubOutlines[shapeId][key];

      assert.equal(curve[0].virtual, bCurve.virtual);
      // TODO: t1 / t2 asserts

      curve.forEach(function(point, j) {
        delete point._t1;
        delete point._t2;
        delete point.virtual;
      });

      assert.deepEqual(curve, bCurve.points);
    });

    assert.deepEqual(shape.bbox, cubOutlines[shapeId].bbox);
  });
}());

(function testIntersects() {

}());

(function testLineIntersects() {

}());

(function testSelfIntersects() {

}());

(function testCurveIntersects() {

}());

(function testArcs() {

}());

/*
 * ## Test utils.fp.js
 */

(function testMakeline() {
  var p1 = {x: 20, y: 20};
  var p2 = {x: 40, y: 40};

  deepFreeze(p1);
  deepFreeze(p2);

  assert.deepEqual(utilsFP.makeline(p1, p2), utils.makeline(p1, p2).points);
}());

(function testFindbbox(){
  var sectionsObj = [
    new Bezier(0,0 , 50,25 , 0,50),
    new Bezier(1,1 , 51,26 , 1,51),
  ];
  
  var sections = [
    [{x: 0, y: 0}, {x: 50, y: 25}, {x: 0, y: 50}],
    [{x: 1, y: 1}, {x: 51, y: 26}, {x: 1, y: 51}],
  ];
  
  deepFreeze(sections);
  
  assert.deepEqual(utilsFP.findbbox(sections), utils.findbbox(sectionsObj));
}());

(function testShapeintersections() {
  var s1Obj = utils.makeshape(
    new Bezier(0,0 , 50,25 , 0,50),
    new Bezier(1,1 , 51,26 , 1,51)
  );
  var s2Obj = utils.makeshape(
    new Bezier(50,0 , 0,25 , 50,0),
    new Bezier(51,1 , 1,26 , 51,1)
  );

  var s1 = utilsFP.makeshape(
    [{x: 0, y: 0}, {x: 50, y: 25}, {x: 0, y: 50}],
    [{x: 1, y: 1}, {x: 51, y: 26}, {x: 1, y: 51}]
  );
  var s2 = utilsFP.makeshape(
    [{x: 50, y: 0}, {x: 0, y: 25}, {x: 50, y: 0}],
    [{x: 51, y: 1}, {x: 1, y: 26}, {x: 51, y: 1}]
  );

  deepFreeze(s1);
  deepFreeze(s2);

  assert.deepEqual(
    utilsFP.shapeintersections(s1, s1.bbox, s2, s2.bbox),
    utils.shapeintersections(s1Obj, s1Obj.bbox, s2Obj, s2Obj.bbox)
  );
}());

(function testMakeshape() {
  var forwardObj = new Bezier(0,0 , 50,25 , 0,50);
  var backObj = new Bezier(1,1 , 51,26 , 1,51);

  var forward = [{x: 0, y: 0}, {x: 50, y: 25}, {x: 0, y: 50}];
  var back = [{x: 1, y: 1}, {x: 51, y: 26}, {x: 1, y: 51}];

  deepFreeze(forward);
  deepFreeze(back);

  var shape = utilsFP.makeshape(forward, back);
  var shapeObj = utils.makeshape(forwardObj, backObj)

  assert.deepEqual(shape.back, shapeObj.back.points);
  assert.deepEqual(shape.bbox, shapeObj.bbox);
  assert.deepEqual(shape.endcap, shapeObj.endcap.points);
  assert.deepEqual(shape.forward, shapeObj.forward.points);
  assert.deepEqual(shape.startcap, shapeObj.startcap.points);
}());

(function testGetminmax() {
  var curve = new Bezier(0,0 , 10,10 , 20,30);

  var points = [{x: 0, y: 0}, {x: 10, y: 10}, {x: 20, y: 30}];
  var d = 'x';
  var list = [0];

  deepFreeze(points);
  deepFreeze(d);
  deepFreeze(list);

  assert.deepEqual(
    utilsFP.getminmax(points, d, list),
    utils.getminmax(curve, d, list.concat())
  );
}());

(function testPairiteration() {
  var c1 = new Bezier(0,0 , 10,10 , 20,30);
  var c2 = new Bezier(20,20 , 0,0 , 12,42);

  var p1 = [{x: 0, y: 0}, {x: 10, y: 10}, {x: 20, y: 30}];
  var p2 = [{x: 20, y: 20}, {x: 0, y: 0}, {x: 12, y: 42}];

  deepFreeze(p1);
  deepFreeze(p2);

  assert.deepEqual(
    utilsFP.pairiteration(p1, p2),
    utils.pairiteration(c1, c2)
  );
}());
