import {Status} from "runtime-compat/http";

export default (Location, {status = Status.FOUND} = {}) => app => [
  /* no body */
  null, {
    status,
    headers: {...app.headers(), Location},
  },
];
