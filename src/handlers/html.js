export default (body, {status = 200, partial = false} = {}) =>
  async (env, headers) => {
    return [
      partial ? body : await env.render({body}), {
        status,
        headers: {...headers, "Content-Type": "text/html"},
      },
    ];
  };
