import { FOUND } from "@rcompat/http/status";

/**
 * Redirect request
 * @param {string} Location location to redirect to
 * @param {MinOptions} options handler options
 * @return {ResponseFn}
 */
export default (Location, { status = FOUND } = {}) => app =>
  // no body
  app.respond(null, { status, headers: { Location } });
