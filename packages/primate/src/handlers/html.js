export default (body, {status = 200, partial = false} = {}) =>
  async (app, headers) => {
    return [partial ? body : await app.render({body}), {
      status,
      headers: {...headers, "Content-Type": "text/html"},
    }];
  };
