var utils = require("./lib/utils");
var factory = require("./lib");

var curves = [
  factory.create(150,40, 80,30, 105,150),
  factory.create3D(150,40,0, 80,30,25, 105,150,50),
  factory.create(100,25, 10,90, 110,100, 150,195),
  factory.create3D(100,25,0, 10,90,25, 110,100,50, 150,195,75)
];

curves.forEach(function(c) {
  console.log("Bezier" + c.order + (c._3d ? " (3d)":''));
  console.log("points:", utils.pointsToString(c.points));
  console.log("hodograph:", utils.pointsToString(c.cache.d[0]));
  console.log("equivalent Bezier"+(c.order+1)+":", utils.pointsToString(c.raise().points));
  console.log("curve length:", c.length());
  console.log("reduced curve:", c.reduce().curves.length, "curves");
  console.log("reduced curve length:", c.reduce().length());
});

/*
console.log("---timing tests---");

var limit = 1000;

var start = process.hrtime();
for(var c, i=0; i<limit; i++) {
  c = factory.create(
    Math.random(),Math.random(),
    Math.random(),Math.random(),
    Math.random(),Math.random(),
    Math.random(),Math.random()
  );
}
var end = process.hrtime();
start = start[0] * 1000000000 + start[1];
end = end[0] * 1000000000 + end[1];
var diff = (end-start)/1000000;
console.log("Average curve build time: " + (diff/limit) + "ms");

var start = process.hrtime();
for(var i=0; i<limit; i++) {
  var c = factory.create(
    Math.random(),Math.random(),
    Math.random(),Math.random(),
    Math.random(),Math.random(),
    Math.random(),Math.random()
  );
  for(var s, t=0; t<=1; t+=0.1) {
    c.get(t);
    c.derivative(t);
    c.normal(t);
    s = c.split(t);
    s.left.length();
    s.right.length();
  }
}
var end = process.hrtime();
start = start[0] * 1000000000 + start[1];
end = end[0] * 1000000000 + end[1];
var diff = (end-start)/1000000;
console.log("Average curve build + (compute + derive + normal + length) time: " + (diff/limit) + "ms");
*/
