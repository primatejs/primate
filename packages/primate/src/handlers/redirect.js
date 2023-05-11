import {Found} from "../http-statuses.js";

export default (Location, {status = Found} = {}) => (_, headers) => [
  /* no body */
  null, {
    status,
    headers: {...headers, Location},
  },
];
