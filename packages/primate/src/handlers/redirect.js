export default (Location, {status = 302} = {}) => (_, headers) => [
  /* no body */
  null, {
    status,
    headers: {...headers, Location},
  },
];
