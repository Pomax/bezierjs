import normalise from "./normalise-svg.js";

/**
 * ...
 */
function makeBezier(M, Bezier, term, values) {
  if (term === "Z") return;
  if (term === "M") {
    Object.assign(M, { x: values[0], y: values[1] });
    return;
  }
  if (term === "L") {
    values = [
      (M.x + values[0]) / 2,
      (M.y + values[1]) / 2,
      values[0],
      values[1],
    ];
  }
  const curve = new Bezier(M.x, M.y, ...values);
  const last = values.slice(-2);
  Object.assign(M, { x: last[0], y: last[1] });
  return curve;
}

/**
 * ...
 */
function convertPath(Bezier, d) {
  const terms = normalise(d).split(" "),
    matcher = new RegExp("[MLCQZ]", "");

  let term,
    segment,
    values,
    segments = [],
    ARGS = { C: 6, Q: 4, L: 2, M: 2 };
  const M = { x: false, y: false };

  while (terms.length) {
    term = terms.splice(0, 1)[0];
    if (matcher.test(term)) {
      values = terms.splice(0, ARGS[term]).map(parseFloat);
      segment = makeBezier(M, Bezier, term, values);
      if (segment) segments.push(segment);
    }
  }

  return new Bezier.PolyBezier(segments);
}

export { convertPath };
