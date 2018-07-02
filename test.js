Bezier = require("./lib/Bezier");

var script = function generateSketch(context) {
  const color = () => parseInt(255*Math.random()).toString(16);

  const path = `
  M 840 262
  C 840 262 623 125 458 226
  C 294 326 511 462 511 462
  `;

  const pathSegments = Bezier.SVGtoBeziers(path);

  const circle = `
  M 403 465
  C 403 224 598 28 840 28
  `;

  const circleSegments = Bezier.SVGtoBeziers(circle);

  context.fillStyle = "none";
  let x1, y1, x2, y2;
  [pathSegments, circleSegments].forEach( segments => {
    segments.curves.forEach( segment => {
      context.strokeStyle = `#${color()}${color()}${color()}`;
      let LUT = segment.getLUT(100);
      context.beginPath();
      context.moveTo(LUT[0].x, LUT[0].y);
      for (let i=1; i<100; i++) {
        context.lineTo(LUT[i].x, LUT[i].y);
      }
      context.stroke();
    });
  });

  let intersections, allIntersections = [];
  pathSegments.curves.forEach(pathCurve => {
    circleSegments.curves.forEach(circleCurve => {
      intersections = pathCurve.intersects(circleCurve);
      if (intersections.length) {
        allIntersections = allIntersections.concat(intersections);
      }
    });
  });

  console.log(allIntersections);
};

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
      setTimeout(() => (${script.toString()})(context), 1);
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
