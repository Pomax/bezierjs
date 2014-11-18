module.exports = (function() {
  "use strict";

  var allcurves = [];
  function record(c) { c.id = allcurves.length; allcurves.push(c); }
  function curve(id) { return allcurves[id]; }

  return record;

}());

