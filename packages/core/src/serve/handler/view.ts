import no_handler from "#error/no-handler";
import type { Frontend } from "#serve";
import file from "@rcompat/fs/file";

const extensions = ["extension", "fullExtension"];
type Extension = "extension" | "fullExtension";

/**
 * Render a component using handler for the given filename extension
 * @param name component filename
 * @param props props passed to component
 * @param options rendering options
 * @return Response rendering function
 */
export default ((name, props, options) =>
  (app, transfer, request) => extensions
    .map(extension => app.frontends[file(name)[extension as Extension]])
    .find(extension => extension !== undefined)
    ?.(name, props, options)(app, transfer, request) ?? no_handler(name)
  ) satisfies Frontend;
