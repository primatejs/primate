export default (type: string, x: unknown) =>
  `expected ${type}, got \`${x}\` (${(typeof x)})`;
