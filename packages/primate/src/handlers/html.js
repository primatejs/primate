export default (component, flags = {}) => {
  const {status = 200, partial = false, load = false} = flags;

  return async (app, headers) => {
    const body = load ?
      await app.paths.components.join(component).text() : component;

    return [partial ? body : await app.render({body}), {
      status,
      headers: {...headers, "Content-Type": "text/html"},
    }];
  };
};
