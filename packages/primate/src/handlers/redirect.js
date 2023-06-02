import statuses from "../statuses.js";

export default (Location, {status = statuses.Found} = {}) => (_, headers) => [
  /* no body */
  null, {
    status,
    headers: {...headers, Location},
  },
];
