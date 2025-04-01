import type BuildOptions from "#frontend/BuildOptions";
import compile from "#frontend/compile";
import type { BuildAppHook } from "#module-loader";
import modulename from "#name";

export default ({
  create_root,
  extension,
  name,
  compile: { server, client },
  publish,
  expose,
}: BuildOptions): BuildAppHook => async (app, next) => {
  // compile server
  if (server !== undefined) {
    const filename = `root_${name}.js`;
    const root = await server(create_root(app.depth()));
    const path = app.runpath(app.config("location.server"), filename);
    await path.write(root);
    app.roots.push(path);
  }

  app.register(extension, compile({
    extension,
    name,
    create_root,
    compile: { server, client },
  }));

  app.build.plugin(publish!(app, extension));
  const code = `export { default as spa } from "${modulename}/frontend/spa";`;
  app.build.export(code);
  app.build.export(expose!);

  return next(app);
};
