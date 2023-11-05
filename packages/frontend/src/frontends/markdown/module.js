import { Response, Status, MediaType } from "rcompat/http";
import { stringify, filter } from "rcompat/object";
import { peers } from "../common/exports.js";
import depend from "../depend.js";

const handle = (handler, directory) => (...[name, ...rest]) =>
  async (app, ...noapp) => {
    const base = app.runpath(app.config.location.server, directory);
    const content = await base.join(`${name}.html`).text();
    const toc = await base.join(`${name}.json`).json();

    return handler({ content, toc }, ...rest)(app, ...noapp);
  };

const as_html = ({ content }, _, { status = Status.OK, page } = {}) =>
  async app =>
    new Response(await app.render({ body: content, page }), {
      status,
      headers: { ...await app.headers(), "Content-Type": MediaType.TEXT_HTML },
    });

const name = "markdown";
const dependencies = ["marked"];

const markdown = ({
  extension = "md",
  options,
  handler,
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
      const source = app.runpath(location.components);
      const target = app.runpath(location.server, location.components);

      app.register(extension, {
        handle: handle(handler ?? as_html, location.components),
        compile: {
          async server(component) {
            const text = await component.text();
            const { content, toc } = markdown.compile(text, options);

            const filename = component.path;
            const html = target.join(`${filename}.html`.replace(source, ""));
            await html.directory.create();
            await html.write(content);

            const json = target.join(`${filename}.json`.replace(source, ""));
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
