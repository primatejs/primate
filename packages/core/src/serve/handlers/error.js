import { Status } from "rcompat/http";

/**
 * Render an error page
 * @param {string} body replacement for %body%
 * @param {ErrorOptions} options rendering options
 * @return {ResponseFn}
 */
export default (body = "Not Found", { status = Status.NOT_FOUND, page } = {}) =>
  app => app.view({ body, status, page: page ?? app.get("pages.error") });
