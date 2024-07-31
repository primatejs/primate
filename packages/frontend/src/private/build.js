import compile from "#compile";
import modulename from "#name";
import server_root from "#server-root";

export default ({
  create_root,
  extension,
  name,
  actions,
}) => async (app, next) => {
  // compile server
  await server_root(app, name, create_root, actions.compile.server);

  app.register(extension, await compile({
    app,
    extension,
    name,
    create_root,
    compile: actions.compile,
  }));

  app.build.plugin(actions.publish(app, extension));
  const code = `export { default as spa } from "${modulename}/spa";`;
  app.build.export(code);
  app.build.export(actions.expose);

  return next(app);
};
