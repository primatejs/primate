const http404 = () => {
  const headers = {"Content-Type": "text/html"};
  return {"code": 404, "body": "Page not found", headers};
};

export {http404};
