"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.convertPath = convertPath;

var _normaliseSvg = _interopRequireDefault(require("./normalise-svg.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let M = {
  x: false,
  y: false
};
/**
 * ...
 */

function makeBezier(Bezier, term, values) {
  if (term === "Z") return;

  if (term === "M") {
    M = {
      x: values[0],
      y: values[1]
    };
    return;
  }

  const curve = new Bezier(M.x, M.y, ...values);
  const last = values.slice(-2);
  M = {
    x: last[0],
    y: last[1]
  };
  return curve;
}
/**
 * ...
 */


function convertPath(Bezier, d) {
  const terms = (0, _normaliseSvg.default)(d).split(" "),
        matcher = new RegExp("[MLCQZ]", "");
  let term,
      segment,
      values,
      segments = [],
      ARGS = {
    C: 6,
    Q: 4,
    L: 2,
    M: 2
  };

  while (terms.length) {
    term = terms.splice(0, 1)[0];

    if (matcher.test(term)) {
      values = terms.splice(0, ARGS[term]).map(parseFloat);
      segment = makeBezier(Bezier, term, values);
      if (segment) segments.push(segment);
    }
  }

  return new Bezier.PolyBezier(segments);
}