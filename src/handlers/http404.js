const response = {
  body: "Page not found",
  status: 404,
  headers: {"Content-Type": "text/html"},
};

export default () => () => ({...response});
