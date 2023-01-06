export default async (strings, ...keys) => {
  const body = JSON.stringify(await keys[0]);
  const code = 200;
  const headers = {"Content-Type": "application/json"};
  const type = Symbol.for("handler");
  return {body, code, headers, type};
};
