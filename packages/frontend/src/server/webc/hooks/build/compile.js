import NoClassName from "@primate/frontend/errors/no-class-name";
import file from "@rcompat/fs/file";

const script_re = /(?<=<script)>(?<code>.*?)(?=<\/script>)/gus;
const webc_class_name_re = /export default class (?<name>.*?) extends/u;

export const client = (app, extension) => async (text, component) => {
  const [script] = await Promise.all([...text.matchAll(script_re)]
    .map(({ groups: { code } }) => code));
  const { name } = script.match(webc_class_name_re)?.groups ?? {};
  // app.assert(name !== undefined, NoClassName._(component))
  name === undefined && NoClassName.throw(component);
  const tag = file(component)
    .debase(`${app.path.components}/`)
    .path.replaceAll("/", "-").slice(0, -extension.length);

  const js = `${script} globalThis.customElements.define("${tag}", ${name});`;

  return { js };
};
