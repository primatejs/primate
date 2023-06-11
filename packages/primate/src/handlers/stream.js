export default (body, {status = 200} = {}) => app => [
  body, {
    status,
    headers: {...app.headers(), "Content-Type": "application/octet-stream"},
  },
];
