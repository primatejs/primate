const getContent = async (env, name) => {
  try {
    return await env.paths.components.join(`${name}.html`).file.read();
  } catch (error) {
    throw new Error(`cannot load component at ${name}.html`);
  }
};

export default (content, {status = 200, partial = false, adhoc = false} = {}) =>
  async (env, headers) => {
    const html = adhoc ? content : await getContent(env, content);
    return [
      partial ? html : await env.render(html), {
        status,
        headers: {...headers, "Content-Type": "text/html"},
      },
    ];
  };
