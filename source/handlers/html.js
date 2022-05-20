import {File} from "runtime-compat/filesystem";
import Parser from "./DOM/Parser.js";
import {index} from "../Bundler.js";
import _conf from "../conf.js";
const conf = _conf();

const {paths: {components: path}} = conf;
const ending = -5;
const load_file = async name =>
  [name.slice(0, ending), await File.read(`${path}/${name}`)];
const components = await File.exists(path)
  ? Object.fromEntries(await Promise.all((await File.list(path)).map(load_file)))
  : {};

const last = -1;
export default async (strings, ...keys) => {
  const html = await (await Parser.parse(strings
    .slice(0, last)
    .map((string, i) => `${string}$${i}`)
    .join("") + strings[strings.length + last], await Promise.all(keys))
    .unfold(components))
    .render();
  const body = (await index(conf)).replace("<body>", () => `<body>${html}`);
  const code = 200;
  const headers = {"Content-Type": "text/html"};
  return {body, code, headers};
};
