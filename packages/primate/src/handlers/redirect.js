import {Response, Status} from "runtime-compat/http";

export default (Location, {status = Status.FOUND} = {}) => app =>
  /* no body */
  new Response(null, {
    status,
    headers: {...app.headers(), Location},
  });
