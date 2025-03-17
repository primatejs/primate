const types = {
  a: "array",
  b: "boolean",
  d: "date",
  n: "number",
  s: "string",
  u: "undefined",
};

const prefix = (at: string) => at ? `${at}: `: "";

export default (type: keyof typeof types, got: unknown, at = "") =>
  `${prefix(at)}expected ${types[type]}, got \`${got}\` (${typeof got})`;

