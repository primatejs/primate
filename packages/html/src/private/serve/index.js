import handler from "#handler";

export default extension => (app, next) => {
  app.register(extension, handler);

  return next(app);
};
