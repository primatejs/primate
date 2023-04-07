export default (name, {partial = false, status = 200} = {}) =>
  async (env, headers) => {
    const html = await env.paths.components.join(`${name}.html`).file.read();
    return [
      partial ? html : await env.render(html), {
        status,
        headers: {...headers, "Content-Type": "text/html"},
      },
    ];
  };
