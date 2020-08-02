import { normalisePath as normalise } from './normalise-svg';

var M = { x: false, y: false };

function makeBezier (Bezier, term, values) {
  if (term === 'Z') return;
  if (term === 'M') {
    M = { x: values[0], y: values[1] };
    return;
  }
  // ES7: new Bezier(M.x, M.y, ...values)
  var cvalues = [false, M.x, M.y].concat(values);
  var PreboundConstructor = Bezier.bind.apply(Bezier, cvalues);
  var curve = new PreboundConstructor();
  var last = values.slice(-2);
  M = { x: last[0], y: last[1] };
  return curve;
}

export function convertPath (Bezier, d) {
  var terms = normalise(d).split(' ');
  var term;
  var matcher = new RegExp('[MLCQZ]', '');
  var segment;
  var values;
  var segments = [];
  var ARGS = { C: 6, Q: 4, L: 2, M: 2 };

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
