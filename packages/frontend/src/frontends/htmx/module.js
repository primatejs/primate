import {Response, Status, MediaType} from "runtime-compat/http";

const load_component = async (file) => {
  try {
    return await file.read();
  } catch (error) {
    throw new Error(`cannot load component at ${file.name}`);
  }
};

const get_body = async (app, partial, file) => {
  const body = await load_component(file);
  return partial ? body : app.render({body});
};

const handler = directory =>
  (name, {status = Status.OK, partial = false} = {}) => async app => {
    const components = app.runpath(directory);
    const code = "import {htmx} from \"app\";";
    await app.publish({code, type: "module", inline: true});

    const headers = app.headers();
    const csp = headers["Content-Security-Policy"].replace(
      "style-src 'self'", "style-src 'self' 'unsafe-inline'"
    );
    const body = await get_body(app, partial, components.join(name).file);

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
export default ({
  extension = "htmx",
  directory,
} = {}) => ({
  name: "primate:htmx",
  async init(app, next) {
    await app.depend("htmx.org", "frontend:htmx");
    return next(app);
  },
  register(app, next) {
    app.register(extension, handler(directory
      ?? app.config.location.components));
    return next(app);
  },
  async publish(app, next) {
    await app.import(name);
    app.export({type: "script", code: `export * as htmx from "${name}";`});
    return next(app);
  },
});
