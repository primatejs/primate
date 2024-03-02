import { File } from "rcompat/fs";
import errors from "./errors.js";

const script_re = /(?<=<script)>(?<code>.*?)(?=<\/script>)/gus;
const webc_class_name_re = /export default class (?<name>.*?) extends/u;

export const compile = {
  async client(text, component) {
    const [script] = await Promise.all([...text.matchAll(script_re)]
      .map(({ groups: { code } }) => code));
    const { name } = script.match(webc_class_name_re)?.groups ?? {};
    name === undefined  && errors.MissingComponentClassName.throw(component);
    const tagname = new File(component).base;

    const js = `${script}
globalThis.customElements.define("${tagname}", ${name});`;

    return { js };
  },
};

export const publish = (_, extension) => ({
  name: "webc",
  setup(build) {
    build.onLoad({ filter: new RegExp(`${extension}$`, "u") }, async args => {
      // Load the file from the file system
      const source = await File.text(args.path);

      return { contents: (await compile.client(source, args.path)).js };
    });
  },
});
