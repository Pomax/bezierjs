var Handler = function(cvs) {
  this.cvs = cvs;
  this.ctx = cvs.getContext("2d");
};

Handler.prototype = {
  recordPoint: function(evt) {
    var x = evt.offsetX==undefined?evt.layerX:evt.offsetX;
    var y = evt.offsetY==undefined?evt.layerY:evt.offsetY;
    this.coords.push({ x:x, y:y });

    var ctx = this.ctx;
    ctx.beginPath();
    ctx.arc(x,y,0.1,0,tau);
    ctx.stroke();
  },

  md: function(evt) {
    this.ctx.strokeStyle = "black";
    this.recording = true;
    this.coords = [];
    this.recordPoint(evt);
  },

  mm: function(evt) {
    if(this.recording) {
      this.recordPoint(evt);
    }
  },

  me: function(evt) {
    this.recording = false;
    this.cvs.width = this.cvs.width;
    var ctx = this.ctx;

    // original poinds
    ctx.strokeStyle="rgba(100,100,200,0.6)";
    this.coords.forEach(function(p) {
      ctx.beginPath();
      ctx.arc(p.x,p.y,0.2,0,tau);
      ctx.stroke();
    }.bind(this));

    // reduced points
    ctx.strokeStyle="red";
    rdp.runRDP(this.coords).forEach(function(p) {
      ctx.beginPath();
      ctx.arc(p.x,p.y,1,0,tau);
      ctx.stroke();
    }.bind(this));

  }
};