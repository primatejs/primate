import {Response, Status, MediaType} from "runtime-compat/http";

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

const handler = (name, {status = Status.OK, partial = false} = {}) =>
  async app => {
    const {build: {paths: {components}}} = app;
    const code = "import {htmx} from \"app\";";
    await app.publish({code, type: "module", inline: true});

    const headers = app.headers();
    const csp = headers["Content-Security-Policy"].replace(
      "style-src 'self'", "style-src 'self' 'unsafe-inline'"
    );
    const body = await getBody(app, partial, components.join(name).file);

    return new Response(body, {
      status,
      headers: {
        ...headers,
        "Content-Type": MediaType.TEXT_HTML,
        "Content-Security-Policy": csp,
      },
    });
  };

const name = "htmx.org";
export default _ => ({
  name: "primate:htmx",
  register(app, next) {
    app.register("htmx", handler);
    return next(app);
  },
  async publish(app, next) {
    await app.import(name);
    app.export({type: "script", code: `export * as htmx from "${name}";`});
    return next(app);
  },
});
