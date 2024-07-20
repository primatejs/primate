
import { parse, compileTemplate } from "vue/compiler-sfc";

export const server = text => compileTemplate({
  source: parse(text).descriptor.template.content,
  id: "1",
}).code;
