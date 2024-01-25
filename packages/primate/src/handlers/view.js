import errors from "../errors.js";

/**
 * @param {string} name - component filename
 * @param {object} props - component props
 * @param {object} options - response options
 * @return {function(app: any, ...rest: any): Response } - rendering function
 */
export default (name, props, options) => async (app, ...rest) => {
  const extension = name.slice(name.lastIndexOf("."));
  return app.extensions[extension]?.handle(name, props, options)(app, ...rest)
    ?? errors.NoHandlerForExtension.throw(extension, name);
};
