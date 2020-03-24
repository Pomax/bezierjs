class Handler {
  constructor(cvs) {
    this.cvs = cvs;
    this.ctx = cvs.getContext("2d");
    this.bg = false;
  }

  /**
   *
   */
  cacheBackground() {
    var img = new Image();
    img.src = this.cvs.toDataURL();
    this.bg = img;
  }

  /**
   *
   * @param {*} evt
   */
  recordPoint(evt) {
    var x = evt.clientX;
    var y = evt.clientY - this.cvs.getBoundingClientRect().top;
    this.coords.push({ x, y });

    // draw point while we draw
    var ctx = this.ctx;
    ctx.beginPath();
    ctx.arc(x, y, 0.1, 0, tau);
    ctx.stroke();
  }

  /**
   *
   * @param {*} evt
   */
  start(evt) {
    this.ctx.strokeStyle = "black";
    if (this.bg)
      this.ctx.drawImage(this.bg, 0, 0, this.cvs.width, this.cvs.height);
    this.recording = true;
    this.coords = [];
    this.recordPoint(evt);
  }

  /**
   *
   * @param {*} evt
   */
  record(evt) {
    if (this.recording) {
      this.recordPoint(evt);
    }
  }

  /**
   *
   * @param {*} evt
   */
  end(evt) {
    this.recording = false;
    this.cvs.width = this.cvs.width;
    if (this.bg)
      this.ctx.drawImage(this.bg, 0, 0, this.cvs.width, this.cvs.height);
    var rdpcoords = rdp.runRDP(this.coords);

    this.drawCR(rdpcoords);
    // this.drawBeziers(rdpcoords);
    this.drawArcs(rdpcoords);
    this.drawCoords();
    this.drawRDP(rdpcoords);
    this.cacheBackground();
  }

  /**
   * Try to fit circular arcs to the original input data
   * @param {*} coords
   */
  drawArcs(rdpcoords) {
    const ctx = this.ctx;
    const coords = this.coords;

    function step(s, e) {
      let m = (e - s) / 2,
        start = rdpcoords[s],
        spos = coords.indexOf(start),
        midpoint,
        end = rdpcoords[e],
        epos = coords.indexOf(end);

      if (m == (m | 0)) {
        midpoint = rdpcoords[m];
      } else {
        let pos = m | 0,
          c1 = rdpcoords[pos],
          c2 = rdpcoords[pos + 1];
        midpoint = {
          x: (c1.x + c2.x) / 2,
          y: (c1.y + c2.y) / 2
        };
      }

      let arc = Bezier.getUtils().getccenter(start, midpoint, end),
        center = { x: arc.x, y: arc.y },
        subset = coords.slice(spos, epos),
        n = subset.length,
        MSE =
          subset.reduce((t, v) => (t += Math.abs(dist(center, v) - arc.r)), 0) /
          n;
      return { arc, MSE, spos, epos };
    }

    for (let s = 0, e = 2, i = 0; i < rdpcoords.length - 2; i++) {
      let ret = step(s, e + i);
      let arc = ret.arc;
      console.log(ret.MSE);
      ctx.beginPath();
      ctx.strokeStyle = ret.MSE < 1 ? "rgb(0,20,20)" : "rgba(0,200,200,0.4)";
      ctx.arc(arc.x, arc.y, arc.r, arc.s, arc.e);
      ctx.stroke();
    }
  }

  /**
   *
   */
  drawCoords() {
    const ctx = this.ctx;
    ctx.strokeStyle = "rgba(100,100,200,0.6)";
    this.coords.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 0.2, 0, tau);
      ctx.stroke();
    });
  }

  /**
   *
   * @param {*} rdcoords
   */
  drawRDP(rdpcoords) {
    const ctx = this.ctx;
    rdpcoords.forEach(p => {
      ctx.strokeStyle = "red";
      if (p.acute) {
        ctx.strokeStyle = "purple";
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1, 0, tau);
      ctx.stroke();
    });
  }

  /**
   *
   * @param {*} rdpcoords
   */
  drawCR(rdpcoords) {
    // for CR curve fitting of all points, we need a virtual first and last coordinate
    rdpcoords.unshift({
      x: rdpcoords[0].x - (rdpcoords[0].x - rdpcoords[1].x),
      y: rdpcoords[0].y - (rdpcoords[0].y - rdpcoords[1].y)
    });

    let last = rdpcoords.length - 1;
    rdpcoords.push({
      x: rdpcoords[last].x + (rdpcoords[last].x - rdpcoords[last - 1].x),
      y: rdpcoords[last].y + (rdpcoords[last].y - rdpcoords[last - 1].y)
    });

    const ctx = this.ctx;
    ctx.strokeStyle = "rgba(0,200,0,0.5)";
    let c1 = rdpcoords[0],
      c2 = rdpcoords[1],
      c3 = rdpcoords[2],
      c4 = rdpcoords[3],
      p2,
      p3,
      p4;
    ctx.moveTo(c2.x, c2.y);
    for (let p = 4, e = rdpcoords.length; p <= e; p++) {
      if (p % 2 === 0) {
        ctx.strokeStyle = "rgba(200,100,0,0.5)";
      } else {
        ctx.strokeStyle = "rgba(0,200,0,0.5)";
      }

      if (c3.acute) {
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

      c1 = !c3.acute
        ? c2
        : {
            x: c3.x - (c4.original.x - c3.x),
            y: c3.y - (c4.original.y - c3.y)
          };
      c2 = c3;
      c3 = c3.acute ? c4.original : c4;
      c4 = rdpcoords[p];
    }

    // and then we need to remove those virtual first/last coordinates again
    rdpcoords.pop();
    rdpcoords.shift();
  }

  /**
   * Similar to POTrace, we try to fit a cubic Bezier by
   * scaling and reorienting points so that they define
   * a crude "bitmap", which we use as a lookup to find
   * the "close enough without any curve fitting" curve.
   * Then we see if we can massage that to a better fit.
   * @param {*} rdpcoords
   */
  drawBeziers(rdpcoords) {
    const ctx = this.ctx;

    let endPos = rdpcoords.findIndex(v => v.actute);
    endPos = endPos === -1 ? rdpcoords.length - 1 : endPos;
    let start = rdpcoords[0],
      end = rdpcoords[endPos],
      points = rdpcoords.slice(1, endPos - 1);

    // try to fit a single curve to this
    let midpoint = points[(points.length / 2) | 0];

    let b = Bezier.cubicFromPoints(start, midpoint, end, 0.5, 100);

    // draw this curve
    ctx.strokeStyle = "rgb(100,200,200)";
    ctx.moveTo(b.points[0].x, b.points[0].y);
    ctx.bezierCurveTo(
      b.points[1].x,
      b.points[1].y,
      b.points[2].x,
      b.points[2].y,
      b.points[3].x,
      b.points[3].y
    );
    ctx.stroke();
  }
}

export { Handler };
