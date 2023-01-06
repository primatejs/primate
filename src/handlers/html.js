import Parser from "./DOM/Parser.js";

const last = -1;

export default components => async (strings, ...keys) => {
  const body = await (await Parser.parse(strings
    .slice(0, last)
    .map((string, i) => `${string}$${i}`)
    .join("") + strings[strings.length + last], await Promise.all(keys))
    .unfold(components))
    .render();
  const code = 200;
  const headers = {"Content-Type": "text/html"};
  const type = Symbol.for("handler");
  return {body, code, headers, type};
};
