const loadComponent = async (file) => {
  try {
    return await file.read();
  } catch (error) {
    throw new Error(`cannot load component at ${file.name}`);
  }
};

const getBody = async (app, partial, file) => {
  const body = await loadComponent(file);
  return partial ? body : app.render({body});
};

const handler = path => (name, {status = 200, partial = false} = {}) =>
  async app => {
    const code = "import {htmx} from \"app\";";
    await app.publish({code, type: "module", inline: true});

    const headers = app.headers();
    const csp = headers["Content-Security-Policy"].replace(
      "style-src 'self'", "style-src 'self' 'unsafe-inline'"
    );

    const options = {
      status,
      headers: {
        ...headers,
        "Content-Type": "text/html",
        "Content-Security-Policy": csp,
      },
    };
    return [await getBody(app, partial, path.join(name).file), options];
  };

export default directory => ({
  name: "@primate/htmx",
  register(app, next) {
    app.register("htmx", handler(directory ?? app.paths.components));
    return next(app);
  },
  async publish(app, next) {
    const name = "htmx.org";
    await app.import(name);
    app.bootstrap({type: "script", code: `export * as htmx from "${name}";`});
    return next(app);
  },
});
