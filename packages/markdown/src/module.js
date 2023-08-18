import {Response, Status, MediaType} from "runtime-compat/http";
import {marked} from "marked";

const make_component = base => name => import(base.join(`${name}.js`));

const respond = (handler, directory) => (...[name, ...rest]) => app =>
  make_component(app.build.paths.server.join(directory))(name)
    .then(component => handler(component, ...rest));

const as_html = app => async (component, _, {status = Status.OK} = {}) =>
  new Response(await app.render({body: component.render()}), {
    status,
    headers: {...await app.headers(), "Content-Type": MediaType.TEXT_HTML},
});

export default ({
  directory,
  extension = "md",
  options,
  handler,
  props = [],
} = {}) => {
  const env = {};
  const copy_re = new RegExp(`^.*.(?:${extension})$`, "u");
  const collect_re = new RegExp(`^.*.${extension}$`, "u");

  const identity_heading = (text, level) => `<h${level}>${text}</h${level}>`;
  const monkeyed_heading = options?.renderer?.heading ?? identity_heading;

  return {
    name: "primate:markdown",
    init(app, next) {
      console.log(next);
      env.directory = directory ?? app.config.paths.components;

      return next(app);
    },
    register(app, next) {
      app.register(extension, respond(handler ?? as_html(app), env.directory));
      return next(app);
    },
    async compile(app, next) {
      const source = app.paths.build.join(env.directory);
      // copy ${env.directory} to build/${env.directory}
      await app.copy(app.root.join(env.directory), source, copy_re);
      const components = await source.collect(collect_re);
      const target = app.build.paths.server.join(env.directory);
      await target.file.create();

      await Promise.all(components.map(async component => {
        const toc = [];
        const renderer = {
          ...options?.renderer ?? {},
          heading(text, level) {
            const name = text.toLowerCase().replaceAll(/[?{}%]/gu, "");
            toc.push({level, text, name});
            return monkeyed_heading(text, level);
          },
        };
        marked.use({
          ...options,
          renderer,
        });
        const content = marked.parse(await component.file.read());
        const code = `
          export function toc() {
            return JSON.parse(${JSON.stringify(JSON.stringify(toc))});
          }
          export function render(props = {}) {
            ${props.map(prop => `const {${prop} = ""} = props;`).join("\n")}
            return \`${content}\`;
          }`;
        const to = target.join(`${component.path}.js`.replace(source, ""));
        await to.directory.file.create();
        await to.file.write(code);
      }));

      return next(app);
    },
  };
};
