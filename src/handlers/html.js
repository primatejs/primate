const getContent = async (env, name) => {
  try {
    return await env.paths.components.join(`${name}.html`).file.read();
  } catch (error) {
    throw new Error(`cannot load component at ${name}.html`);
  }
};

export default (content, {status = 200, partial = false, adhoc = false} = {}) =>
  async (env, headers) => {
    const body = adhoc ? content : await getContent(env, content);
    return [
      partial ? body : await env.render({body}), {
        status,
        headers: {...headers, "Content-Type": "text/html"},
      },
    ];
  };
