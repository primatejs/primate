import {Status} from "runtime-compat/http";

export default (Location, {status = Status.Found} = {}) => (_, headers) => [
  /* no body */
  null, {
    status,
    headers: {...headers, Location},
  },
];
