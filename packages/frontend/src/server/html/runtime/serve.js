import handler from "@primate/frontend/base/html-handler";

export default extension => (app, next) => {
  app.register(extension, handler);

  return next(app);
};
