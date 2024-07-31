import server from "./server.js";

export default extension => async (app, next) => {
  const extensions = {
    from: extension,
    to: ".js",
  };

  app.register(extension, {
    server: component => server(app, component, extensions),
    client: _ => _,
  });

  return next(app);
};
