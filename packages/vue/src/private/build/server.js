import { parse, compileTemplate } from "vue/compiler-sfc";

export default text => compileTemplate({
  source: parse(text).descriptor.template.content,
  id: "1",
}).code;
