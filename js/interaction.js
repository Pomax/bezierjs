function handleInteraction(cvs, draw) {
  // curve.mouse = false;

  var fix = function(e) {
    e = e || window.event;
    var target = e.target || e.srcElement,
        rect = target.getBoundingClientRect();
    e.offsetX = e.clientX - rect.left;
    e.offsetY = e.clientY - rect.top;
  };

  var moving = false, mx = my = ox = oy = 0, cx, cy, mp = false;

  var handler = { onupdate: function() {} };

  cvs.addEventListener("mousedown", function(evt) {
    fix(evt);
    mx = evt.offsetX;
    my = evt.offsetY;
    for(l of lg.curves){
      for(var p of l.points){
        if(Math.abs(mx-p.x)<10 && Math.abs(my-p.y)<10) {
          moving = true;
          mp = p;
          cx = p.x;
          cy = p.y;
        }
      }
    }
  });

  cvs.addEventListener("mousemove", function(evt) {
    fix(evt);

    var found = false;

    for(c of lg.curves){
      if(!c.points) return;
        c.points.forEach(function(p) {
          var mx = evt.offsetX;
          var my = evt.offsetY;
          if(Math.abs(mx-p.x)<10 && Math.abs(my-p.y)<10) {
            found = found || true;
          }

          if(!moving) {
            return handler.onupdate(evt);
          }

          ox = evt.offsetX - mx;
          oy = evt.offsetY - my;
          mp.x = cx + ox;
          mp.y = cy + oy;
          handler.onupdate();
        });
        cvs.style.cursor = found ? "pointer" : "default";
    };
    draw.draw(lg)
  });

  cvs.addEventListener("mouseup", function(evt) {
    if(!moving) return;
    // console.log(curve.points.map(function(p) { return p.x+", "+p.y; }).join(", "));
    moving = false;
    mp = false;
  });

  cvs.addEventListener("click", function(evt) {
    fix(evt);
    var mx = evt.offsetX;
    var my = evt.offsetY;
  });

  return handler;
}

function bindInteraction(canvas, linegroup){
  canvas.onmousemove = function(event){
    console.log('move event: ', event)

  }
}