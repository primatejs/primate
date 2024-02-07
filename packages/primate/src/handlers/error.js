import { Status } from "rcompat/http";

export default (body = "Not Found", { status = Status.NOT_FOUND, page } = {}) =>
  app => app.respond({ body, status, page: page ?? app.config.pages.error });
