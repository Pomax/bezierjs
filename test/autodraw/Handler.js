class Handler {
  constructor(cvs) {
    this.cvs = cvs;
    this.ctx = cvs.getContext("2d");
  }

  recordPoint(evt) {
    var x = evt.offsetX==undefined?evt.layerX:evt.offsetX;
    var y = evt.offsetY==undefined?evt.layerY:evt.offsetY;
    this.coords.push({ x:x, y:y });

    var ctx = this.ctx;
    ctx.beginPath();
    ctx.arc(x,y,0.1,0,tau);
    ctx.stroke();
  }

  md(evt) {
    this.ctx.strokeStyle = "black";
    this.recording = true;
    this.coords = [];
    this.recordPoint(evt);
  }

  mm(evt) {
    if(this.recording) {
      this.recordPoint(evt);
    }
  }

  me(evt) {
    this.recording = false;
    this.cvs.width = this.cvs.width;
    var ctx = this.ctx;

    // original points
    ctx.strokeStyle="rgba(100,100,200,0.6)";
    this.coords.forEach(function(p) {
      ctx.beginPath();
      ctx.arc(p.x,p.y,0.2,0,tau);
      ctx.stroke();
    }.bind(this));

    // reduced points
    ctx.strokeStyle="red";
    rdp.runRDP(this.coords).forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x,p.y,1,0,tau);
      ctx.stroke();
    });

    // CR curve fitting: note that we'll
    // miss the first and last segment due to CR conversion...
    ctx.strokeStyle="rgba(0,200,0,0.5)";
    let p1, p2, p3, p4;
    let c1 = this.coords[0], c2 = this.coords[1], c3 = this.coords[2], c4 = this.coords[3];
    ctx.moveTo(c1.x, c1.y);
    for(let p=4, e=this.coords.length-1; p<e; p++) {
      c1 = c2; c2 = c3; c3 = c4; c4 = this.coords[p];

      p1 = c2;
      p2 = { x: c2.x + (c3.x - c1.x) / 6, y: c2.y + (c3.y - c1.y) / 6 };
      p3 = { x: c3.x - (c4.x - c2.x) / 6, y: c3.y - (c4.y - c2.y) / 6 };
      p4 = c3;

      ctx.bezierCurveTo(p2.x, p2.y, p3.x, p3.y, p4.x, p4.y);
      ctx.stroke();
    }

    // Redo this curve after aesthetic cleanup?

    // TODO: code goes here
  }
}
