export default (body, {status = 200} = {}) => (_, headers) => [
  JSON.stringify(body), {
    status,
    headers: {...headers, "Content-Type": "application/json"},
  },
];
