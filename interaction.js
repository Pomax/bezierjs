// User interaction
(function handleInteraction() {

  var fix = function(e) {
    e = e || window.event;
    if(e.offsetX) return;
    var target = e.target || e.srcElement,
        rect = target.getBoundingClientRect();
    e.offsetX = e.clientX - rect.left;
    e.offsetY = e.clientY - rect.top;
  };

  lpts = curve.points;
  var moving = false, mx = my = ox = oy = 0, cx, cy, mp = false;
  cvs.addEventListener("mousedown", function(evt) {
    fix(evt);
    mx = evt.offsetX;
    my = evt.offsetY;
    lpts.forEach(function(p) {
      if(Math.abs(mx-p.x)<10 && Math.abs(my-p.y)<10) {
        moving = true;
        mp = p;
        cx = p.x;
        cy = p.y;
      }
    });
  });

  cvs.addEventListener("mousemove", function(evt) {
    fix(evt);
    var found = false;
    lpts.forEach(function(p) {
      var mx = evt.offsetX;
      var my = evt.offsetY;
      if(Math.abs(mx-p.x)<10 && Math.abs(my-p.y)<10) {
        found = found || true;
      }
    });
    cvs.style.cursor = found ? "pointer" : "default";

    if(!moving) return;
    iroots = [];
    outline = false;
    shapes = false;
    ox = evt.offsetX - mx;
    oy = evt.offsetY - my;
    mp.x = cx + ox;
    mp.y = cy + oy;
  });

  cvs.addEventListener("mouseup", function(evt) {
    if(!moving) return;
    console.log(curve.points.map(function(p) { return p.x+", "+p.y; }).join(", "));
    showArcLength();
    moving = false;
    mp = false;
    intersections = false;
  });

  cvs.addEventListener("click", function(evt) {
    fix(evt);
    var mx = evt.offsetX;
    var my = evt.offsetY;
    console.log(mx%300, my);
  });

}());
