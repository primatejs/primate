import no_handler from "#error/no-handler";
import type Frontend from "#frontend";
import FileRef from "@rcompat/fs/FileRef";

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
    .map(extension => app.frontends[new FileRef(name)[extension as Extension]])
    .find(extension => extension !== undefined)
    ?.(name, props, options)(app, transfer, request) ?? no_handler(name)
  ) as Frontend;
