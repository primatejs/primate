import { Response, Status, MediaType } from "runtime-compat/http";

export default (body = "Not Found", { status = Status.NOT_FOUND, page } = {}) =>
  async app => new Response(await app.render({
    body,
    page: page ?? app.config.pages.error }), {
      status,
      headers: { ...app.headers(), "Content-Type": MediaType.TEXT_HTML },
    });
