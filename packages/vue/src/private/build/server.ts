import transform from "@rcompat/build/transform";
import { compileScript, compileTemplate, parse, type SFCDescriptor } from "vue/compiler-sfc";

const genDefaultAs = "__SCRIPT__";
const id_size = 8;

const analyze = ({ script, scriptSetup }: SFCDescriptor ) => {
  return {
    inline: scriptSetup !== null,
    has_script: script !== null || scriptSetup !== null,
    is_typescript: script?.lang === "ts" || scriptSetup?.lang === "ts",
  };
};
const options = { loader: "ts" } as const;

export default async (text: string) => {
  const id = crypto.randomUUID().slice(0, id_size);
  const { descriptor } = parse(text);
  const { inline, has_script, is_typescript } = analyze(descriptor);

  const template = compileTemplate({
    filename: "",
    id,
    source: descriptor.template?.content ?? ""
  });
  const script = has_script
    ? compileScript(descriptor, { id, inlineTemplate: inline, genDefaultAs })
    : { content: `const ${genDefaultAs} = {}` };

  const module = `
    ${inline ? "" : template.code}
    ${script.content}

    export default { ...__SCRIPT__, ${inline ? "" : "render"} };
  `;

  return is_typescript ? (await transform(module, options)).code : module;
};
