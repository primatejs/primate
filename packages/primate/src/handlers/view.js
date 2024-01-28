import { File } from "rcompat/fs";
import errors from "../errors.js";

export default (name, props, options) => async (app, ...rest) => {
  const { fullExtension: extension } = new File(name);
  return app.extensions[extension]?.handle(name, props, options)(app, ...rest)
    ?? errors.NoHandlerForExtension.throw(extension, name);
};
