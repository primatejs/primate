import {Response, Status, MediaType} from "runtime-compat/http";
import {filter} from "runtime-compat/object";
import {peers} from "../common/exports.js";
import depend from "../../depend.js";

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

const name = "htmx";
const dependencies = ["htmx.org"];
const default_extension = "htmx";
const on = filter(peers, ([key]) => dependencies.includes(key));

export default ({
  directory,
  extension = default_extension,
} = {}) => ({
  name: `primate:${name}`,
  async init(app, next) {
    await depend(on, `frontend:${name}`);

    return next(app);
  },
  register(app, next) {
    const {config} = app;

    app.register(extension, handler(directory ?? config.location.components));

    return next(app);
  },
  async publish(app, next) {
    const [dependency] = dependencies;
    await app.import(dependencies);
    const code = `export * as ${name} from "${dependency}";`;

    app.export({type: "script", code});

    return next(app);
  },
});
