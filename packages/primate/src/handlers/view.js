import errors from "../errors.js";

export default (name, props, options) => async (app, ...rest) => {
  const extension = name.slice(name.lastIndexOf(".") + 1);
  return app.handlers[extension]?.(name, props, options)(app, ...rest)
    ?? errors.NoHandlerForExtension.throw(extension, name);
};
