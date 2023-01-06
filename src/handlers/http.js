const http404 = () => {
  const body = "Page not found";
  const code = 404;
  const headers = {"Content-Type": "text/html"};
  const type = Symbol.for("handler");
  return {body, code, headers, type};
};

export {http404};
