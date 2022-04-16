import Parser from "./DOM/Parser.js";
import conf from "../conf.js";
import Directory from "../Directory.js";
import File from "../File.js";

const last = -1;
const {paths: {"components": path}} = conf();
const components = {};
if (await File.exists(path)) {
  const names = await Directory.list(path);
  for (const name of names) {
    components[name.slice(0, -5)] = await File.read(`${path}/${name}`);
  }
}

export default async (strings, ...keys) => {
  const awaited_keys = await Promise.all(keys);
  const body = await (await Parser.parse(strings
    .slice(0, last)
    .map((string, i) => `${string}$${i}`)
    .join("") + strings[strings.length+last], awaited_keys)
    .unfold(components))
    .render();
  const code = 200;
  const headers = {"Content-Type": "text/html"};
  return {code, body, headers};
};
