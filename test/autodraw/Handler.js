class Handler {
  constructor(cvs) {
    this.cvs = cvs;
    this.ctx = cvs.getContext("2d");
    this.bg = false;
  }

  recordPoint(evt) {
    var x = evt.clientX;
    var y = evt.clientY - this.cvs.getBoundingClientRect().top;
    this.coords.push({ x, y });

    // draw point while we draw
    var ctx = this.ctx;
    ctx.beginPath();
    ctx.arc(x,y,0.1,0,tau);
    ctx.stroke();
  }

  start(evt) {
    this.ctx.strokeStyle = "black";
    if (this.bg) this.ctx.drawImage(this.bg, 0, 0, this.cvs.width, this.cvs.height);
    this.recording = true;
    this.coords = [];
    this.recordPoint(evt);
  }

  record(evt) {
    if(this.recording) {
      this.recordPoint(evt);
    }
  }

  end(evt) {
    this.recording = false;
    this.cvs.width = this.cvs.width;
    var ctx = this.ctx;
    if (this.bg) this.ctx.drawImage(this.bg, 0, 0, this.cvs.width, this.cvs.height);
    var rdpcoords = rdp.runRDP(this.coords);

    // CR curve fitting, with virtual first/last coordinate
    rdpcoords.unshift({
      x: rdpcoords[0].x - (rdpcoords[0].x - rdpcoords[1].x),
      y: rdpcoords[0].y - (rdpcoords[0].y - rdpcoords[1].y)
    });

    let last = rdpcoords.length - 1;
    rdpcoords.push({
      x: rdpcoords[last].x + (rdpcoords[last].x - rdpcoords[last - 1].x),
      y: rdpcoords[last].y + (rdpcoords[last].y - rdpcoords[last - 1].y)
    });

    ctx.strokeStyle="rgba(0,200,0,0.5)";
    let c1 = rdpcoords[0], c2 = rdpcoords[1], c3 = rdpcoords[2], c4 = rdpcoords[3], p2, p3, p4;
    ctx.moveTo(c2.x, c2.y);
    for(let p=4, e=rdpcoords.length; p<=e; p++) {
      if (p%2===0) { ctx.strokeStyle="rgba(200,100,0,0.5)"; } else { ctx.strokeStyle="rgba(0,200,0,0.5)"; }

      if (c3.oblique) {
        c4 = {
          x: c3.x + (c3.x - c2.x),
          y: c3.y + (c3.y - c2.y),
          original: c4
        };
      }

      p2 = { x: c2.x + (c3.x - c1.x) / 6, y: c2.y + (c3.y - c1.y) / 6 };
      p3 = { x: c3.x - (c4.x - c2.x) / 6, y: c3.y - (c4.y - c2.y) / 6 };
      p4 = c3;

      ctx.bezierCurveTo(p2.x, p2.y, p3.x, p3.y, p4.x, p4.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(p4.x, p4.y);

      if (c3.oblique) {
        c1 = {
          x: c3.x - (c4.original.x - c3.x),
          y: c3.y - (c4.original.y - c3.y),
        };
        c2 = c3;
        c3 = c4.original;
        c4 = rdpcoords[p];
      } else {
        c1 = c2;
        c2 = c3;
        c3 = c4;
        c4 = rdpcoords[p];
      }
    }

    // ====
    rdpcoords.unshift();
    rdpcoords.pop();
    console.log(rdpcoords);
    // ====


    // TODO: let's simplify!

    // TODO: Redo this curve after aesthetic cleanup?

    // original points
    ctx.strokeStyle="rgba(100,100,200,0.6)";
    this.coords.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x,p.y,0.2,0,tau);
      ctx.stroke();
    });

    console.log(rdpcoords);

    // reduced points
    rdpcoords.forEach(p => {
      ctx.strokeStyle="red";
      if (p.oblique) {
        ctx.strokeStyle="purple";
      }
      ctx.beginPath();
      ctx.arc(p.x,p.y,1,0,tau);
      ctx.stroke();
    });

    var img = new Image();
    img.src = this.cvs.toDataURL();
    console.log(img);
    this.bg = img;
  }
}

export { Handler };
