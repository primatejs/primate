export default (body, {status = 200} = {}) => app => [
  JSON.stringify(body), {
    status,
    headers: {...app.headers(), "Content-Type": "application/json"},
  },
];
