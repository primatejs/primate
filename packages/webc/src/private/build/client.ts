import no_class_name from "#error/no-class-name";
import type FileRef from "@rcompat/fs/FileRef";
import type { BuildApp } from "@primate/core/build/app";

const script_re = /(?<=<script)>(?<code>.*?)(?=<\/script>)/gus;
const webc_class_name_re = /export default class (?<name>.*?) extends/u;

export default (app: BuildApp, extension: string) =>
  async (text: string, component: FileRef) => {
    const [script] = await Promise.all([...text.matchAll(script_re)]
      .map(({ groups }) => groups!.code));
    const { name } = script.match(webc_class_name_re)?.groups
      ?? { name: undefined };
    // app.assert(name !== undefined, NoClassName._(component))
    name === undefined && no_class_name(component.toString());
    const tag = component
      .debase(`${app.path.components}/`)
      .path.replaceAll("/", "-").slice(0, -extension.length);

    const js = `${script} globalThis.customElements.define("${tag}", ${name});`;

    return { js };
};
