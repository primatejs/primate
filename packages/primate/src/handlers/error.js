import { Response, Status, MediaType } from "rcompat/http";

export default (body = "Not Found", { status = Status.NOT_FOUND, page } = {}) =>
  async app =>
    new Response(await app.render({ body }, page ?? app.config.pages.error), {
      status,
      headers: { ...app.headers(), "Content-Type": MediaType.TEXT_HTML },
    });
