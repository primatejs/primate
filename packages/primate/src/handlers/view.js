export default (name, props, options) => async (app, headers) => {
  const ending = name.slice(name.lastIndexOf(".") + 1);
  const handler = app.handlers[ending];
  if (handler === undefined) {
    return app.log.error(new Error(`no handler for ${ending} components`));
  }
  return handler(name, {load: true, ...props}, options)(app, headers);
};
