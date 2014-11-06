var Bezier = require("./lib");

function check(b) {
  console.log("---");
  console.log(b.toString());
  console.log(b.length());
  console.log(b.dpoints);
  console.log(b.derivative(0), b.derivative(0.5), b.derivative(1));
  console.log(b.normal(0), b.normal(0.5), b.normal(1));

  var res = b.split(0.321);
  var points = res.span;
//  console.log(utils.pointsToString(points));
  var p321 = b.get(0.321);
//  console.log("check on final point: should be ", utils.pointToString(p321));

  var roots = b.inflections();
  console.log(roots);

  console.log(b.bbox());
}

check(new Bezier(0,0 , 0.5,1 , 1,0));
check(new Bezier(0,0 , 0,1   , 1,1 , 1,0));
// b = new Bezier(120,160, 35,200, 220,260, 220,40);
