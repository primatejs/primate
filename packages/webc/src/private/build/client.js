import no_class_name from "#error/no-class-name";
import FileRef from "@rcompat/fs/FileRef";

const script_re = /(?<=<script)>(?<code>.*?)(?=<\/script>)/gus;
const webc_class_name_re = /export default class (?<name>.*?) extends/u;

export default (app, extension) => async (text, component) => {
  const [script] = await Promise.all([...text.matchAll(script_re)]
    .map(({ groups: { code } }) => code));
  const { name } = script.match(webc_class_name_re)?.groups ?? {};
  // app.assert(name !== undefined, NoClassName._(component))
  name === undefined && no_class_name(component);
  const tag = new FileRef(component)
    .debase(`${app.path.components}/`)
    .path.replaceAll("/", "-").slice(0, -extension.length);

  const js = `${script} globalThis.customElements.define("${tag}", ${name});`;

  return { js };
};
