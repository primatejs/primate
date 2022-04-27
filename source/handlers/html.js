import {File} from "runtime-compat";
import Parser from "./DOM/Parser.js";
import {index} from "../Bundler.js";
import _conf from "../conf.js";
const conf = _conf();

const {"paths": {"components": path}} = conf;
const components = {};
if (await File.exists(path)) {
  const names = await File.list(path);
  for (const name of names) {
    components[name.slice(0, -5)] = await File.read(`${path}/${name}`);
  }
}

const last = -1;
export default async (strings, ...keys) => {
  const html = await (await (await Parser.parse(strings
    .slice(0, last)
    .map((string, i) => `${string}$${i}`)
    .join("") + strings[strings.length + last], await Promise.all(keys))
    .unfold(components)))
    .render();
  const body = (await index(conf)).replace("<body>", () => `<body>${html}`);
  const code = 200;
  const headers = {"Content-Type": "text/html"};
  return {body, code, headers};
};
