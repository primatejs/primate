const response = {
  body: "Page not found",
  code: 404,
  headers: {"Content-Type": "text/html"},
};

export default () => () => ({...response});
