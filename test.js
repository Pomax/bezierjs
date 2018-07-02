Bezier = require("./lib/Bezier");

function generateSketch(context) {
  context = context || { moveTo: ()=>{}, lineTo: ()=>{} };

  const hex = n => {
    n = n.toString(16);
    return n.length<2 ? '0'+n : n;
  };

  const drawCurve = curve => {
    let steps = 100;
    let LUT = curve.getLUT(steps);
    for (let i=1; i<steps; i++) {
      let f = parseInt(255 * i/steps),
          r = hex(255 - f),
          g = hex(f),
          b = hex(255);
      context.strokeStyle = `#${r}${g}${b}`;
      context.beginPath();
      context.moveTo(LUT[i-1].x, LUT[i-1].y);
      context.lineTo(LUT[i].x, LUT[i].y);
      context.stroke();
    }
  }

  function showIntersection(intersections, c1, c2) {
    context.strokeStyle = 'black';
    intersections.forEach( p => {
      var times = p.split('/').map(parseFloat);
          p1 = c1.get(times[0]),
          p2 = c2.get(times[1]);
        context.beginPath();
        context.arc(p1.x,p2.y,10,0,2*Math.PI);
        context.stroke();
    });
  }

  const path = "M840,262.0692849215183C840,262.0692849215183,623.2217248247962,125.99769017911373,458.8059257701127,226.22470571650527C294.39012671542923,326.45172125389684,511.1684018906331,462.5233159963014,511.1684018906331,462.5233159963014";
  const pathSegments = Bezier.SVGtoBeziers(path);
  pathSegments.curves.forEach(drawCurve);

  const circle = "M 403.37 465.5C 403.37 224.35590968129048 598.8559096812905 28.870000000000005 840 28.870000000000005C 1081.1440903187095 28.870000000000005 1276.63 224.35590968129048 1276.63 465.5C 1276.63 706.6440903187096 1081.1440903187095 902.13 840 902.13C 598.8559096812905 902.13 403.37 706.6440903187096 403.37 465.5Z";
  const circleSegments = Bezier.SVGtoBeziers(circle);
  circleSegments.curves.forEach(drawCurve);

  pathSegments.curves.forEach(c1 => {
    circleSegments.curves.forEach(c2 => {
      let intersections = c1.intersects(c2);
      showIntersection(intersections, c1, c2);
    });
  });
}

var liveServer = require("live-server");

var params = {
    file: "test.html",
    middleware: [
      function(req, res, next) {
        console.log(req.url);

        if (req.url === "/") {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.write(`
<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>test</title>
    <script src="./bezier.js"></script>
  </head>
  <body>
    <h1>Testing</h1>

    <script>
      var canvas = document.createElement("canvas");
      canvas.width = canvas.height = 800;
      var context = canvas.getContext("2d");
      document.body.append(canvas);
      setTimeout(() => (${generateSketch.toString()})(context), 1);
    </script>
  </body>
</html>
          `);
          res.end();
        } else { next(); }
      }
    ]
};

liveServer.start(params);
