const http404 = () => {
  const body = "Page not found";
  const code = 404;
  const headers = {"Content-Type": "text/html"};
  return {body, code, headers};
};

export {http404};
