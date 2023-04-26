export default (body = "Not Found", {status = 404} = {}) => (_, headers) => [
  body, {
    status,
    headers: {...headers, "Content-Type": "text/html"},
  },
];
