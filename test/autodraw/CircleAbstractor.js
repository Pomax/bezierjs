class CircleAbstractor {

  protected class Point {
    double x, y, s, e, r;
    public Point(double _x, double _y) { x = _x; y = _y; }
    String toString() { return x+","+y+", r:"+r+", s:"+s+", e:"+e; }
  }

  BezierCurve curve;
  double errorThreshold;
  double TAU = Math.PI*2;

  /**
   *
   */
  CircleAbstractor(BezierCurve curve) {
    this(curve, 0.5);
  }

  /**
   *
   */
  CircleAbstractor(BezierCurve curve, double errorThreshold) {
    this.errorThreshold = errorThreshold;
    this.curve = curve;
  }

  /**
   *
   */
  ArrayList<Point> getCircles() {
    return iterate(this.errorThreshold);
  }

  /**
   *
   */
  Point getCCenter(Point p1, Point p2, Point p3) {
    // deltas
    double dx1 = (p2.x - p1.x),
           dy1 = (p2.y - p1.y),
           dx2 = (p3.x - p2.x),
           dy2 = (p3.y - p2.y);

    // perpendiculars (quarter circle turned)
    double dx1p = dx1 * cos(PI/2) - dy1 * sin(PI/2),
           dy1p = dx1 * sin(PI/2) + dy1 * cos(PI/2),
           dx2p = dx2 * cos(PI/2) - dy2 * sin(PI/2),
           dy2p = dx2 * sin(PI/2) + dy2 * cos(PI/2);

    // chord midpoints
    double mx1 = (p1.x + p2.x)/2,
           my1 = (p1.y + p2.y)/2,
           mx2 = (p2.x + p3.x)/2,
           my2 = (p2.y + p3.y)/2;

    // midpoint offsets
    double mx1n = mx1 + dx1p,
           my1n = my1 + dy1p,
           mx2n = mx2 + dx2p,
           my2n = my2 + dy2p;

    // intersection of these lines:
    Point i = lli(mx1,my1,mx1n,my1n, mx2,my2,mx2n,my2n);
    double r = dist(i,p1);

    // arc start/end values, over mid point
    double s = atan2(p1.y - i.y, p1.x - i.x),
           m = atan2(p2.y - i.y, p2.x - i.x),
           e = atan2(p3.y - i.y, p3.x - i.x);

    // determine arc direction (cw/ccw correction)
    double __;
    if (s<e) {
      // if s<m<e, arc(s, e)
      // if m<s<e, arc(e, s + TAU)
      // if s<e<m, arc(e, s + TAU)
      if (s>m || m>e) { s += TAU; }
      if (s>e) { __=e; e=s; s=__; }
    } else {
      // if e<m<s, arc(e, s)
      // if m<e<s, arc(s, e + TAU)
      // if e<s<m, arc(s, e + TAU)
      if (e<m && m<s) { __=e; e=s; s=__; } else { e += TAU; }
    }

    // assign and done.
    i.s = s;
    i.e = e;
    i.r = r;
    return i;
  }

  /**
   *
   */
  Point lli(double x1, double y1, double x2, double y2, double x3, double y3, double x4, double y4) {
    // slight duplication w.r.t BezierComputer.pde
    double nx=(x1*y2-y1*x2)*(x3-x4)-(x1-x2)*(x3*y4-y3*x4),
           ny=(x1*y2-y1*x2)*(y3-y4)-(y1-y2)*(x3*y4-y3*x4),
           d=(x1-x2)*(y3-y4)-(y1-y2)*(x3-x4);
    if(d==0) { return null; }
    return new Point(nx/d, ny/d);
  }

  /**
   *
   */
  ArrayList<Point> iterate(double errorThreshold) {
    ArrayList<Point> circles = new ArrayList<Point>();
    return __iterate(errorThreshold, circles);
  }

  Point get(double t) {
    float s = (float) t;
    return new Point(this.curve.getXValue(s), this.curve.getYValue(s));
  }

  /**
   *
   */
  ArrayList<Point> __iterate(double errorThreshold, ArrayList<Point> circles) {
    double s = 0, e = 1;

    // we do a binary search to find the "good `t` closest to no-longer-good"
    do {
      // step 1: start with the maximum possible arc
      e = 1;
      Point np1 = get(s),
            np2,
            np3,
            pc=null,
            prev_pc;

      boolean curr_good = false,
              prev_good = false,
              done;

      double m = e,
             prev_e = 1;

      int step = 0;

      // step 2: find the best possible arc
      do {
        prev_good = curr_good;
        prev_pc = pc;
        m = (s + e)/2;
        step++;

        np2 = get(m);
        np3 = get(e);
        pc = getCCenter(np1, np2, np3);
        double error = getError(pc, np1, s, e);
        curr_good = error <= errorThreshold;

        //println("params:",s,m,e,prev_e,error);

        done = prev_good && !curr_good;
        if(!done) prev_e = e;

        // this arc is fine: we can move 'e' up to see if we can find a wider arc
        if(curr_good) {
          // if e is already at max, then we're done for this arc.
          if (e >= 1) { prev_e = 1; break; }
          e = e + (e - s)/2;
        }
        // this is a bad arc: we need to move 'e' down to find a good arc
        else { e = m; }
      }
      while(!done);

      //println("arc found:",s,",",prev_e,":",prev_pc.s+","+prev_pc.e);

      prev_pc = prev_pc == null ? pc : prev_pc;
      circles.add(prev_pc);
      s = prev_e;
    }
    while(e < 1);

    return circles;
  }

  /**
   *
   */
  double getError(Point pc, Point np1, double s, double e) {
    double q = (e - s) / 4;

    // get an error estimate baesd on the quarter points
    Point c1 = get(s + q),
          c2 = get(e - q);

    // distance from pc to c1/c2
    double ref = dist(pc, np1),
           d1  = dist(pc, c1),
           d2  = dist(pc, c2);

    return abs(d1-ref) + abs(d2-ref);
  }

  /**
   *
   */
  double dist(Point p1, Point p2) {
    double dx = p1.x - p2.x,
           dy = p1.y - p2.y;
    return sqrt(dx*dx + dy*dy);
  }

}
