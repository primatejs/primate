import MissingComponentClassName from
  "@primate/frontend/errors/missing-component-class-name";
import { File } from "rcompat/fs";

const script_re = /(?<=<script)>(?<code>.*?)(?=<\/script>)/gus;
const webc_class_name_re = /export default class (?<name>.*?) extends/u;

export const client = (app, extension) => async (text, component) => {
  const [script] = await Promise.all([...text.matchAll(script_re)]
    .map(({ groups: { code } }) => code));
  const { name } = script.match(webc_class_name_re)?.groups ?? {};
  name === undefined && MissingComponentClassName.throw(component);
  const tag = new File(component)
    .debase(`${app.runpath(app.get("location.components"))}/`)
    .path.replaceAll("/", "-").slice(0, -extension.length);

  const js = `${script} globalThis.customElements.define("${tag}", ${name});`;

  return { js };
};
