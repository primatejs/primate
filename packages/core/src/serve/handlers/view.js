import { NoHandler } from "@primate/core/errors";
import { File } from "rcompat/fs";

const extensions = ["extension", "fullExtension"];
/**
 * Render a component using handler for the given filename extension
 * @param {string} name component filename
 * @param {object} props props passed to component
 * @param {object} options rendering options
 * @return {ResponseFn}
 */
export default (name, props, options) => (app, ...rest) => extensions
  .map(extension => app.handlers[new File(name)[extension]])
  .find(extension => extension !== undefined)
  ?.(name, props, options)(app, ...rest) ?? NoHandler.throw(name);
