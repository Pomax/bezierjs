function updateLUT(lg, points){
    for(var i=0; i<points; i++){

    }
  }

function handleInteraction(cvs, draw) {
  // curve.mouse = false;

  var fix = function(e) {
    // e = e || window.event;
    var target = e.target || e.srcElement,
        rect = target.getBoundingClientRect();
    e.offsetX = e.clientX - rect.left;
    e.offsetY = e.clientY - rect.top;
  };

  var moving = false, mx = my = ox = oy = 0, cx, cy, mp = false;

  var handler = { onupdate: function() {} };

  cvs.addEventListener("mousedown", function(evt) {
    console.log("mousedown")
    fix(evt);
    mx = evt.offsetX;
    my = evt.offsetY;
    for(l of lg.curves){
      for(var p of l.points){
        if(Math.abs(mx-p.x)<10 && Math.abs(my-p.y)<10) {
          moving = true;
          mp = p;
          console.log("point", mp)
          cx = p.x;
          cy = p.y;
        }
      }
    }
  });

  cvs.addEventListener("dblclick", function(evt) {
    console.log('dblclick')
    fix(evt);
    var lx = evt.offsetX;
    var ly = evt.offsetY;
    //keep track of the closest t, and closest curve
    var tmin=undefined;
    var cmin
    //see if were close to a line
    for(c of lg.curves){
      var t = c.project({x:lx,y:ly})
      var lp = c.get(t)
      console.log(t)
      if(!tmin || t.d<10){
        tmin = t
        cmin=c
      }  
    }

    if(tmin.d<10){
      lg.split(cmin,tmin);
    }
    draw.draw(lg)
    //this prevents 
    window.getSelection().removeAllRanges();
  })

  cvs.addEventListener("mousemove", function(evt) {
    fix(evt);
    var found = false;
    var lx = evt.offsetX;
    var ly = evt.offsetY;

    if(!moving){
      for(c of lg.curves){
        // just in case we don't have any points in a curve
        if(!c.points) continue;
        //see if were close to a point on the line
        c.points.forEach(function(p) {
          if(Math.abs(lx-p.x)<10 && Math.abs(ly-p.y)<10) {
            found = found || true;
          }
        });
      };
      cvs.style.cursor = found ? "crosshair" : "default";
    }

    ox = evt.offsetX - mx;
    oy = evt.offsetY - my;
    mp.x = cx + ox;
    mp.y = cy + oy;
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