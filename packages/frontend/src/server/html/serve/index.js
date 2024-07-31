import handler from "#html/handler";

export default extension => (app, next) => {
  app.register(extension, handler);

  return next(app);
};
