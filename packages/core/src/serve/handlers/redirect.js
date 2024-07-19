import { Status } from "rcompat/http";

/**
 * Redirect request
 * @param {string} Location location to redirect to
 * @param {MinOptions} options handler options
 * @return {ResponseFn}
 */
export default (Location, { status = Status.FOUND } = {}) => app =>
  // no body
  app.respond(null, { status, headers: { Location } });
