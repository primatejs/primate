import {Response, Status, MediaType} from "runtime-compat/http";

export default (body, {status = Status.OK} = {}) => app =>
  new Response(JSON.stringify(body), {
    status,
    headers: {...app.headers(), "Content-Type": MediaType.APPLICATION_JSON},
  });
