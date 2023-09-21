import {Response, Status, MediaType} from "runtime-compat/http";
import {filter} from "runtime-compat/object";
import {peers} from "../common/exports.js";
import depend from "../depend.js";

const load_component = async (file) => {
  try {
    return await file.read();
  } catch (error) {
    throw new Error(`cannot load component at ${file.name}`);
  }
};

const style = "'unsafe-inline'";
const code = "import {htmx} from \"app\";";

const handler = directory =>
  (name, {status = Status.OK, partial = false} = {}) => async app => {
    const components = app.runpath(directory);
    const {head, csp} = await app.inline(code, "module");
    const headers = {style, script: csp};
    const body = await load_component(components.join(name).file);

    return new Response(partial ? body : await app.render({body, head}), {
      status,
      headers: {...app.headers(headers), "Content-Type": MediaType.TEXT_HTML},
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
    await app.import(dependency);
    const code = `export * as ${name} from "${dependency}";`;

    app.export({type: "script", code});

    return next(app);
  },
});
