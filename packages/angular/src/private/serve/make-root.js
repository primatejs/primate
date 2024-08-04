import { reflectComponentType } from "@angular/core";
import stringify from "@rcompat/object/stringify";
import root_component from "./root-component.js";

const double_to_single = string => string.replaceAll("\"", "'");

export default (real_root, props) => {
  const { selector } = reflectComponentType(real_root);
  const attributes = Object.entries(props)
    .map(([key, value]) => `[${key}]="${double_to_single(stringify(value))}"`)
    .join(" ");

  return root_component({
    imports: [real_root],
    template: `<${selector} ${attributes}></${selector}>`,
  });
};
