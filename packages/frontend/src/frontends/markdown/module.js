import {Response, Status, MediaType} from "runtime-compat/http";
import {stringify, filter} from "runtime-compat/object";
import {peers} from "../common/exports.js";
import depend from "../depend.js";

const respond = (handler, directory) => (...[name, ...rest]) =>
  async (app, ...noapp) => {
    const base = app.runpath(app.config.location.server, directory);
    const content = await base.join(`${name}.html`).text();
    const toc = await base.join(`${name}.json`).json();

    return handler({content, toc}, ...rest)(app, ...noapp);
  };

const as_html = ({content}, _, {status = Status.OK, page} = {}) => async app =>
  new Response(await app.render({body: content, page}), {
    status,
    headers: {...await app.headers(), "Content-Type": MediaType.TEXT_HTML},
});

const name = "markdown";
const dependencies = ["marked"];

const markdown = ({
  directory,
  extension = "md",
  options,
  handler,
} = {}) => {
  const env = {};
  const re = new RegExp(`^.*.(?:${extension})$`, "u");
  const on = filter(peers, ([key]) => dependencies.includes(key));

  return {
    name: `primate:${name}`,
    async init(app, next) {
      await depend(on, `frontend:${name}`);
      markdown.compile = (await import("./compile.js")).default;
      env.directory = directory ?? app.config.location.components;

      return next(app);
    },
    register(app, next) {
      app.register(extension, respond(handler ?? as_html, env.directory));
      return next(app);
    },
    async compile(app, next) {
      const {location} = app.config;
      const source = app.runpath(env.directory);
      // copy ${env.directory} to build/${env.directory}
      await app.stage(app.root.join(env.directory), env.directory, re);

      const components = await source.collect(re);
      const target = app.runpath(location.server, env.directory);
      await target.file.create();

      await Promise.all(components.map(async component => {
        const text = await component.text();
        const {content, toc} = markdown.compile(text, options);

        const filename = component.path;
        const html = target.join(`${filename}.html`.replace(source, ""));
        await html.directory.file.create();
        await html.file.write(content);

        const json = target.join(`${filename}.json`.replace(source, ""));
        await json.file.write(stringify(toc));
      }));

      return next(app);
    },
  };
};

export default markdown;
