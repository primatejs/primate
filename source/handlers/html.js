import {File} from "runtime-compat";
import Parser from "./DOM/Parser.js";
import {index} from "../Bundler.js";
import _conf from "../conf.js";
const conf = _conf();

const last = -1;
const {"paths": {"components": path}} = conf;
const components = {};
if (await File.exists(path)) {
  const names = await File.list(path);
  for (const name of names) {
    components[name.slice(0, -5)] = await File.read(`${path}/${name}`);
  }
}

export default async (strings, ...keys) => {
  const awaited_keys = await Promise.all(keys);
  const rendered = await (await (await Parser.parse(strings
    .slice(0, last)
    .map((string, i) => `${string}$${i}`)
    .join("") + strings[strings.length+last], awaited_keys)
    .unfold(components)))
    .render();
  const body = (await index(conf)).replace("<body>", () => `<body>${rendered}`);
  const code = 200;
  const headers = {"Content-Type": "text/html"};
  return {code, body, headers};
};
