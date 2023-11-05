import { Response, Status, MediaType } from "rcompat/http";
import { filter } from "rcompat/object";
import { peers } from "../common/exports.js";
import depend from "../depend.js";

const load_component = async path => {
  try {
    return await path.text();
  } catch (error) {
    throw new Error(`cannot load component at ${path.name}`);
  }
};

const style = "'unsafe-inline'";

const handler = directory =>
  (name, { status = Status.OK, partial = false } = {}) => async app => {
    const code = "import { htmx } from \"app\";";
    const components = app.runpath(directory);
    const { head, csp } = await app.inline(code, "module");
    const headers = { style, script: csp };
    const body = await load_component(components.join(name));

    return new Response(partial ? body : await app.render({ body, head }), {
      status,
      headers: { ...app.headers(headers), "Content-Type": MediaType.TEXT_HTML },
    });
  };

const name = "htmx";
const dependencies = ["htmx.org"];
const default_extension = "htmx";
const on = filter(peers, ([key]) => dependencies.includes(key));

export default ({ extension = default_extension } = {}) => ({
  name: `primate:${name}`,
  async init(app, next) {
    await depend(on, `frontend:${name}`);

    return next(app);
  },
  async register(app, next) {
    const { config } = app;

    const [dependency] = dependencies;
    await app.import(dependency);
    const code = `export * as ${name} from "${dependency}";`;
    app.export({ type: "script", code });
    app.register(extension, { handle: handler(config.location.components) });

    return next(app);
  },
});
