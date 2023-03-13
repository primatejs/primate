export default () => () => ["Page not found", {
  status: 404,
  headers: {"Content-Type": "text/html"},
}];
