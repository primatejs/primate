const _404 = "Not Found";

export default (body = _404, {status = 404} = {}) => async (app, headers) => [
  await app.render({body}), {
    status,
    headers: {...headers, "Content-Type": "text/html"},
  },
];
