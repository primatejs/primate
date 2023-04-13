export default (body = "Not found") => (_, headers) => [
  body, {
    status: 404,
    headers: {...headers, "Content-Type": "text/html"},
  },
];
