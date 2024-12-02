import no_handler from "#error/no-handler";
import file from "@rcompat/fs/file";
import type { Handler } from "#handler";

const extensions = ["extension", "fullExtension"];
type Extension = "extension" | "fullExtension";

/**
 * Render a component using handler for the given filename extension
 * @param name component filename
 * @param props props passed to component
 * @param options rendering options
 * @return Response rendering function
 */
export default ((name, props, options) => (app, ...rest) => extensions
  .map(extension => app.handlers[file(name)[extension as Extension]])
  .find(extension => extension !== undefined)
  ?.(name, props, options)(app, ...rest) ?? no_handler(name)) satisfies Handler;
