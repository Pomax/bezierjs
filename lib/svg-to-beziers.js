var normalise = require("./normalise-svg.js");

var M = { x: false, y: false };

function makeBezier(Bezier, term, values) {
  if (term === 'Z') return;
  if (term === 'M') {
    M = {x: values[0], y: values[1]};
    return;
  }
  return new Bezier(M.x, M.y, ...values);
}

function convertPath(Bezier, d) {
  var terms = normalise(d).split(" "),
    matcher = new RegExp("[MLCQZ]", ""),
    segment,
    values,
    segments = []
    ARGS = { "C": 6, "Q": 4, "L": 2, "M": 2};

  while (terms.length) {
    term = terms.splice(0,1)[0];
    if (matcher.test(term)) {
      values = terms.splice(0,ARGS[term]);
      segment = makeBezier(Bezier, term, values);
      if (segment) segments.push(segment);
    }
  }

  return new Bezier.PolyBezier(segments);
}

module.exports = convertPath;
