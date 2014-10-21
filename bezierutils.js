(function() {
  "use strict";

  // Math functions. I have the Math object with a passion.
  var abs = Math.abs,
      cos = Math.cos,
      sin = Math.sin,
      acos = Math.acos,
      asin = Math.asin,
      atan2 = Math.atan2,
      sqrt = Math.sqrt,
      crt = function(v) { if(v<0) return -Math.pow(-v,1/3); return Math.pow(v,1/3); },
      pi = Math.PI,
      tau = 2*pi;

  /**
   * Utility functions for doing Bezier-related things
   */
  var BezierUtils = {
    // Legendre-Gauss abscissae (x_i values, defined at i=n as the roots of the nth order Legendre polynomial Pn(x))
    Tvalues: [
      -0.0640568928626056260850430826247450385909,
       0.0640568928626056260850430826247450385909,
      -0.1911188674736163091586398207570696318404,
       0.1911188674736163091586398207570696318404,
      -0.3150426796961633743867932913198102407864,
       0.3150426796961633743867932913198102407864,
      -0.4337935076260451384870842319133497124524,
       0.4337935076260451384870842319133497124524,
      -0.5454214713888395356583756172183723700107,
       0.5454214713888395356583756172183723700107,
      -0.6480936519369755692524957869107476266696,
       0.6480936519369755692524957869107476266696,
      -0.7401241915785543642438281030999784255232,
       0.7401241915785543642438281030999784255232,
      -0.8200019859739029219539498726697452080761,
       0.8200019859739029219539498726697452080761,
      -0.8864155270044010342131543419821967550873,
       0.8864155270044010342131543419821967550873,
      -0.9382745520027327585236490017087214496548,
       0.9382745520027327585236490017087214496548,
      -0.9747285559713094981983919930081690617411,
       0.9747285559713094981983919930081690617411,
      -0.9951872199970213601799974097007368118745,
       0.9951872199970213601799974097007368118745
    ],

    // Legendre-Gauss weights (w_i values, defined by a function linked to in the Bezier primer article)
    Cvalues: [
      0.1279381953467521569740561652246953718517,
      0.1279381953467521569740561652246953718517,
      0.1258374563468282961213753825111836887264,
      0.1258374563468282961213753825111836887264,
      0.1216704729278033912044631534762624256070,
      0.1216704729278033912044631534762624256070,
      0.1155056680537256013533444839067835598622,
      0.1155056680537256013533444839067835598622,
      0.1074442701159656347825773424466062227946,
      0.1074442701159656347825773424466062227946,
      0.0976186521041138882698806644642471544279,
      0.0976186521041138882698806644642471544279,
      0.0861901615319532759171852029837426671850,
      0.0861901615319532759171852029837426671850,
      0.0733464814110803057340336152531165181193,
      0.0733464814110803057340336152531165181193,
      0.0592985849154367807463677585001085845412,
      0.0592985849154367807463677585001085845412,
      0.0442774388174198061686027482113382288593,
      0.0442774388174198061686027482113382288593,
      0.0285313886289336631813078159518782864491,
      0.0285313886289336631813078159518782864491,
      0.0123412297999871995468056670700372915759,
      0.0123412297999871995468056670700372915759
    ],
    arcfn: function(p, t) {
      var xbase = this.derivativeDim(p,'x',t);
      var ybase = this.derivativeDim(p,'y',t);
      var combined = xbase*xbase + ybase*ybase;
      return sqrt(combined);
    },
    length: function(p) {
      var z=0.5,sum=0,len=this.Tvalues.length,i,t;
      for(i=0; i<len; i++) {
        t = z * this.Tvalues[i] + z;
        sum += this.Cvalues[i] * this.arcfn(p,t);
      }
      return z * sum;
    },
    map: function(v, ds,de, ts,te) {
      var d1 = de-ds, d2 = te-ts, v2 =  v-ds, r = v2/d1;
      return ts + d2*r;
    },
    copy: function(obj) {
      return JSON.parse(JSON.stringify(obj));
    },
    lli: function(v1, v2) {
      var x1=v1.c.x, y1=v1.c.y,
          x2=v1.x, y2=v1.y,
          x3=v2.c.x,y3=v2.c.y,
          x4=v2.x,y4=v2.y,
          nx=(x1*y2-y1*x2)*(x3-x4)-(x1-x2)*(x3*y4-y3*x4),
          ny=(x1*y2-y1*x2)*(y3-y4)-(y1-y2)*(x3*y4-y3*x4),
          d=(x1-x2)*(y3-y4)-(y1-y2)*(x3-x4);
      if(d==0) { return false; }
      return { x: nx/d, y: ny/d, z: 0 };
    },
    makeline: function(p1,p2) {
      var x1 = p1.x, y1 = p1.y, x2 = p2.x, y2 = p2.y, dx = (x2-x1)/3, dy = (y2-y1)/3;
      return new Bezier(x1, y1, x1+dx, y1+dy, x1+2*dx, y1+2*dy, x2, y2);
    },
    findbbox: function(sections) {
      var mx=99999999,my=mx,MX=-mx,MY=MX;
      sections.forEach(function(s) {
        var bbox = s.bbox();
        if(mx > bbox.x.min) mx = bbox.x.min;
        if(my > bbox.y.min) my = bbox.y.min;
        if(MX < bbox.x.max) MX = bbox.x.max;
        if(MY < bbox.y.max) MY = bbox.y.max;
      });
      return {
        x: { min: mx, mid:(mx+MX)/2, max: MX, size:MX-mx },
        y: { min: my, mid:(my+MY)/2, max: MY, size:MY-my }
      }
    },
    shapeintersections: function(s1, bbox1, s2, bbox2) {
      if(!this.bboxoverlap(bbox1, bbox2)) return [];
      var intersections = [];
      var a1 = [s1.startcap, s1.forward, s1.back, s1.endcap];
      var a2 = [s2.startcap, s2.forward, s2.back, s2.endcap];
      a1.forEach(function(l1) {
        if(l1.virtual) return;
        a2.forEach(function(l2) {
          if(l2.virtual) return;
          var iss = l1.intersects(l2);
          if(iss.length>0) {
            iss.c1 = l1;
            iss.c2 = l2;
            iss.s1 = s1;
            iss.s2 = s2;
            intersections.push(iss);
          }
        });
      });
      return intersections;
    },
    makeshape: function(forward, back) {
      var start  = this.makeline(back.points[3], forward.points[0]);
      var end    = this.makeline(forward.points[3], back.points[0]);
      var shape  = {
        startcap: start,
        forward: forward,
        back: back,
        endcap: end,
        bbox: this.findbbox([start, forward, back, end])
      };
      var self = this;
      shape.intersections = function(s2) {
        return self.shapeintersections(shape,shape.bbox,s2,s2.bbox);
      };
      return shape;
    },
    computeDim: function(p,v,t) {
      p = [p[0][v], p[1][v], p[2][v], p[3][v]];
      var mt = 1-t,
          t2 = t*t,
          mt2 = mt*mt,
          a = mt2*mt,
          b = mt2*t*3,
          c = mt*t2*3,
          d = t*t2;
      return a*p[0] + b*p[1] + c*p[2] + d*p[3];
    },
    derivativeDim: function(p,v,t) {
      p = [3*(p[1][v] - p[0][v]), 3*(p[2][v] - p[1][v]), 3*(p[3][v] - p[2][v])];
      var mt = 1-t,
          a = mt*mt,
          b = mt*t*2,
          c = t*t;
      return a*p[0] + b*p[1] + c*p[2];
    },
    splitDim: function(p,v,z) {
      // see http://pomax.github.io/bezierinfo/#matrixsplit
      p = [p[0][v], p[1][v], p[2][v], p[3][v]];
      var zm = z-1,
          z2 = z*z,
          zm2 = zm*zm,
          z3 = z2*z,
          zm3 = zm2*zm;
      var p1 = p[0],
          p2 = z*p[1] - zm*p[0],
          p3 = z2*p[2] - 2*z*zm*p[1] + zm2*p[0],
          p4 = z3*p[3] - 3*z2*zm*p[2] + 3*z*zm2*p[1]-zm3*p[0],
          p5 = p4,
          p6 = z2*p[3] - 2*z*zm*p[2] + zm2*p[1],
          p7 = z*p[3] - zm*p[2],
          p8 = p[3];
      return [[p1,p2,p3,p4],[p5,p6,p7,p8]];
    },
    getminmax: function(curve, d, list) {
      if(!list) return { min:0, max:0 };
      var min=0xFFFFFFFFFFFFFFFF, max=-min,t,c;
      if(list.indexOf(0)===-1) { list = [0].concat(list); }
      if(list.indexOf(1)===-1) { list.push(1); }
      for(var i=0,len=list.length; i<len; i++) {
        t = list[i];
        c = curve.get(t);
        if(c[d] < min) { min = c[d]; }
        if(c[d] > max) { max = c[d]; }
      }
      return { min:min, mid:(min+max)/2, max:max, size:max-min };
    },
    align: function(points, line) {
      var tx = line.p1.x,
          ty = line.p1.y,
          a = -atan2(line.p2.y-ty, line.p2.x-tx),
          d = function(v) {
            return {
              x: (v.x-tx)*cos(a) - (v.y-ty)*sin(a),
              y: (v.x-tx)*sin(a) + (v.y-ty)*cos(a)
            };
          };
      return points.map(d);
    },
    roots: function(points, line) {
      // see http://www.trans4mind.com/personal_development/mathematics/polynomials/cubicAlgebra.htm
      line = line || {p1:{x:0,y:0},p2:{x:1,y:0}};
      var a = this.align(points, line),
          pa = a[0].y,
          pb = a[1].y,
          pc = a[2].y,
          pd = a[3].y,
          d = (-pa + 3*pb - 3*pc + pd),
          a = (3*pa - 6*pb + 3*pc) / d,
          b = (-3*pa + 3*pb) / d,
          c = pa / d,
          p = (3*b - a*a)/3,
          p3 = p/3,
          q = (2*a*a*a - 9*a*b + 27*c)/27,
          q2 = q/2,
          discriminant = q2*q2 + p3*p3*p3,
          u1,v1,x1,x2,x3,
          reduce = function(t) { return 0<=t && t <=1; };
       if (discriminant < 0) {
        var mp3 = -p/3,
            mp33 = mp3*mp3*mp3,
            r = sqrt( mp33 ),
            t = -q/(2*r),
            cosphi = t<-1 ? -1 : t>1 ? 1 : t,
            phi = acos(cosphi),
            crtr = crt(r),
            t1 = 2*crtr;
        x1 = t1 * cos(phi/3) - a/3;
        x2 = t1 * cos((phi+tau)/3) - a/3;
        x3 = t1 * cos((phi+2*tau)/3) - a/3;
        return [x1, x2, x3].filter(reduce);
      } else if(discriminant === 0) {
        u1 = q2 < 0 ? crt(-q2) : -crt(q2);
        x1 = 2*u1-a/3;
        x2 = -u1 - a/3;
        return [x1,x2].filter(reduce);
      } else {
        var sd = sqrt(discriminant);
        u1 = crt(-q2+sd);
        v1 = crt(q2+sd);
        return [u1-v1-a/3].filter(reduce);;
      }
    },
    rootsd1: function(p) {
      // quadratic roots are easy
      var a = 3*(p[1]-p[0]),
          b = 3*(p[2]-p[1]),
          c = 3*(p[3]-p[2]),
          d = a - 2*b + c;
      if(d!==0) {
        var m1 = -sqrt(b*b-a*c),
            m2 = -a+b,
            v1 = -( m1+m2)/d,
            v2 = -(-m1+m2)/d;
        return [v1, v2];
      }
      else if(b!==c && d===0) {
        return [ (2*b-c)/2*(b-c) ];
      }
      return [];
    },
    rootsd2: function(p) {
      // the second derivative is a line
      var a = 3*(p[1]-p[0]),
          b = 3*(p[2]-p[1]),
          c = 3*(p[3]-p[2]);
      a = 2*(b-a);
      b = 2*(c-b);
      if(a!==b) { return [a/(a-b)] }
      return [];
    },
    bboxoverlap: function(b1,b2) {
      var dims=['x','y'],len=dims.length,i,dim,l,t,d
      for(i=0; i<len; i++) {
        dim = dims[i];
        l = b1[dim].mid;
        t = b2[dim].mid;
        d = (b1[dim].size + b2[dim].size)/2;
        if(abs(l-t) >= d) return false;
      }
      return true;
    },
    pairiteration: function(c1,c2) {
      var c1b = c1.bbox(),
          c2b = c2.bbox(),
          r = 100000;
      if(c1b.x.size + c1b.y.size < 0.9 && c2b.x.size + c2b.y.size < 0.9) {
        return [ ((r * (c1._t1+c1._t2)/2)|0)/r + "/" + ((r * (c2._t1+c2._t2)/2)|0)/r ];
      }
      var cc1 = c1.split(0.5),
          cc2 = c2.split(0.5),
          pairs = [
            {left: cc1[0], right: cc2[0] },
            {left: cc1[0], right: cc2[1] },
            {left: cc1[1], right: cc2[1] },
            {left: cc1[1], right: cc2[0] }];
      pairs = pairs.filter(function(pair) {
        return BezierUtils.bboxoverlap(pair.left.bbox(),pair.right.bbox());
      });
      var results = [];
      if(pairs.length === 0) return results;
      pairs.forEach(function(pair) {
        results = results.concat(
          BezierUtils.pairiteration(pair.left, pair.right)
        );
      })
      results = results.filter(function(v,i) {
        return results.indexOf(v) === i;
      });
      return results;
    }
  };

  window.BezierUtils = BezierUtils;

}());