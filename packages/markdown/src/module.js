import {Response, Status, MediaType} from "runtime-compat/http";
import precompile from "./compile.js";

const respond = (handler, directory) => (...[name, ...rest]) => async app => {
  const base = app.runpath(app.config.location.server, directory);
  const content = await base.join(`${name}.html`).text();
  const toc = await base.join(`${name}.json`).json();

  return handler({
    content,
    toc,
  }, ...rest);
};

const as_html = app => async ({content}, _, {status = Status.OK} = {}) =>
  new Response(await app.render({body: content}), {
    status,
    headers: {...await app.headers(), "Content-Type": MediaType.TEXT_HTML},
});

export default ({
  directory,
  extension = "md",
  options,
  handler,
} = {}) => {
  const env = {};
  const re = new RegExp(`^.*.(?:${extension})$`, "u");
  let compile;

  return {
    name: "primate:markdown",
    async init(app, next) {
      env.directory = directory ?? app.config.location.components;

      return next(app);
    },
    register(app, next) {
      app.register(extension, respond(handler ?? as_html(app), env.directory));
      return next(app);
    },
    async compile(app, next) {
      const {location} = app.config;
      const source = app.runpath(directory);
      // copy ${env.directory} to build/${env.directory}
      await app.stage(app.root.join(env.directory), env.directory, re);

      const components = await source.collect(re);
      const target = app.runpath(location.server, env.directory);
      await target.file.create();

      compile = await precompile({
        app,
        directory: env.directory,
        options,
      });

      await Promise.all(components.map(async component =>
        compile(component.path, await component.file.read())));

      return next(app);
    },
    async handle(request, next) {
      return next({...request, markdown: {compile}});
    },
  };
};
