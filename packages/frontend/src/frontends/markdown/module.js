import { File } from "rcompat/fs";
import * as O from "rcompat/object";
import { peers } from "../common/exports.js";
import depend from "../depend.js";

const handle = (handler, directory) => (...[name, ...rest]) =>
  async (app, ...noapp) => {
    const base = app.runpath(app.get("location.server"), directory);
    const body = await base.join(`${name}.html`).text();
    const toc = await base.join(`${name}.json`).json();

    return handler({ body, toc }, ...rest)(app, ...noapp);
  };

const render = ({ body }, _, options) => app => app.view({ body, ...options });

const name = "markdown";
const dependencies = ["marked"];
const default_extension = ".md";

const markdown = ({
  extension = default_extension,
  options,
  renderer,
} = {}) => {
  const on = O.filter(peers, ([key]) => dependencies.includes(key));

  return {
    name: `primate:${name}`,
    async init(app, next) {
      await depend(on, `frontend:${name}`);
      markdown.compile = (await import("./compile.js")).default;

      const location = app.get("location");
      const target = app.runpath(location.server, location.components);

      app.register(extension, {
        handle: handle(renderer ?? render, location.components),
        compile: {
          async server(component) {
            const text = await component.text();
            const { content, toc } = await markdown.compile(text, options);

            const base = target.join(component.debase(app.path.components));
            await File.write(`${base}.html`, content);
            await File.write(`${base}.json`, O.stringify(toc));
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
