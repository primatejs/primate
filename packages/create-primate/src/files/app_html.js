const path = ["pages", "app.html"];

export default root => root.join(...path).file.write(`<!doctype html>
<html>
  <head>
    <title>Primate app</title>
    <meta charset="utf-8" />
    %head%
  </head>
  <body>%body%</body>
</html>`);
