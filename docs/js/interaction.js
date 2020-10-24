export default function handleInteraction(cvs, curve) {
  if (!curve) return {};

  curve.mouse = false;

  var fix = function (e) {
    return e;
  };

  var lpts = curve.points;
  var moving = false,
    mx = 0,
    my = 0,
    ox = 0,
    oy = 0,
    cx,
    cy,
    mp = false;

  var handler = { onupdate: function () {} };

  cvs.addEventListener("mousedown", function (evt) {
    fix(evt);
    mx = evt.offsetX;
    my = evt.offsetY;
    lpts.forEach(function (p) {
      if (Math.abs(mx - p.x) < 10 && Math.abs(my - p.y) < 10) {
        moving = true;
        mp = p;
        cx = p.x;
        cy = p.y;
      }
    });
  });

  cvs.addEventListener("mousemove", function (evt) {
    fix(evt);

    var found = false;

    if (!lpts) return;
    lpts.forEach(function (p) {
      var mx = evt.offsetX;
      var my = evt.offsetY;
      if (Math.abs(mx - p.x) < 10 && Math.abs(my - p.y) < 10) {
        found = found || true;
      }
    });
    cvs.style.cursor = found ? "pointer" : "default";

    if (!moving) {
      return handler.onupdate(evt);
    }

    ox = evt.offsetX - mx;
    oy = evt.offsetY - my;
    mp.x = cx + ox;
    mp.y = cy + oy;
    curve.update();
    handler.onupdate();
  });

  cvs.addEventListener("mouseup", function (evt) {
    if (!moving) return;
    // console.log(curve.points.map(function(p) { return p.x+", "+p.y; }).join(", "));
    moving = false;
    mp = false;
  });

  cvs.addEventListener("click", function (evt) {
    fix(evt);
    var mx = evt.offsetX;
    var my = evt.offsetY;
  });

  return handler;
}
