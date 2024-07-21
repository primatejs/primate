import handler from "./handler.js";

export default extension => (app, next) => {
  app.register(extension, handler);

  return next(app);
};
