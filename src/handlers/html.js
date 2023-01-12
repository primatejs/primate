import Parser from "./DOM/Parser.js";

const last = -1;
const response = {
  code: 200,
  headers: {"Content-Type": "text/html"},
};

export default (strings, ...keys) => async conf => {
  const {components, index} = conf;
  const html = await (await Parser.parse(strings
    .slice(0, last)
    .map((string, i) => `${string}$${i}`)
    .join("") + strings[strings.length + last], await Promise.all(keys))
    .unfold(components))
    .render();
  const body = index.replace("<body>", () => `<body>${html}`);
  return {...response, body};
};
