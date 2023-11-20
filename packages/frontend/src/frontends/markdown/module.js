import { stringify, filter } from "rcompat/object";
import { Path } from "rcompat/fs";
import { peers, respond } from "../common/exports.js";
import depend from "../depend.js";

const handle = (handler, directory) => (...[name, ...rest]) =>
  async (app, ...noapp) => {
    const base = app.runpath(app.config.location.server, directory);
    const body = await base.join(`${name}.html`).text();
    const toc = await base.join(`${name}.json`).json();

    return handler({ body, toc }, ...rest)(app, ...noapp);
  };

const render = ({ body }, _, options) => app => respond({ app, body, options });

const name = "markdown";
const dependencies = ["marked"];
const default_extension = ".md";

const markdown = ({
  extension = default_extension,
  options,
  renderer,
} = {}) => {
  const on = filter(peers, ([key]) => dependencies.includes(key));

  return {
    name: `primate:${name}`,
    async init(app, next) {
      await depend(on, `frontend:${name}`);
      markdown.compile = (await import("./compile.js")).default;

      return next(app);
    },
    register(app, next) {
      const { location } = app.config;
      const target = app.runpath(location.server, location.components);

      app.register(extension, {
        handle: handle(renderer ?? render, location.components),
        compile: {
          async server(component) {
            const text = await component.text();
            const { content, toc } = markdown.compile(text, options);

            const base = target.join(component.debase(app.path.components));
            const html = new Path(`${base}.html`);
            await html.directory.create();
            await html.write(content);

            const json = new Path(`${base}.json`);
            await json.write(stringify(toc));
          },
          // no hydration
          client: _ => _,
        },
      });

      return next(app);
    },
  };
};

export default markdown;
