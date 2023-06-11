import errors from "../errors.js";

export default (name, props, options) => async (app, ...rest) => {
  const ending = name.slice(name.lastIndexOf(".") + 1);
  const handler = app.handlers[ending];
  return handler?.(name, {load: true, ...props}, options)(app, ...rest)
    ?? errors.NoHandlerForExtension.throw(ending, name);
};
