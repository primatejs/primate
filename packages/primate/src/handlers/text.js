import { Response, Status, MediaType } from "rcompat/http";

export default (body, { status = Status.OK } = {}) => app =>
  new Response(body, {
    status,
    headers: { ...app.headers(), "Content-Type": MediaType.TEXT_PLAIN },
  });
