import { Response, Status, MediaType } from "rcompat/http";

export default (body, { status = Status.OK } = {}) => app =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...app.headers(), "Content-Type": MediaType.APPLICATION_JSON },
  });
