import errors from "../errors.js";

export default (name, props, options) => async (app, headers) => {
  const ending = name.slice(name.lastIndexOf(".") + 1);
  const handler = app.handlers[ending];
  return handler?.(name, {load: true, ...props}, options)(app, headers)
    ?? errors.NoHandlerForExtension.throw(ending, name);
};
