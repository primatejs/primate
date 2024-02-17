import o from "rcompat/object";
import { Component as as_component, reflectComponentType } from "@angular/core";
import rootname from "./rootname.js";

const double_to_single = string => string.replaceAll("\"", "'");

const root_component = ({ template, imports }) => as_component({
  selector: rootname,
  imports,
  template,
  standalone: true,
})(class {});

export default (real_root, props) => {
  const { selector } = reflectComponentType(real_root);
  const attributes = Object.o(props)
    .map(([key, value]) => `[${key}]="${double_to_single(o.stringify(value))}"`)
    .join(" ");

  return root_component({
    imports: [real_root],
    template: `<${selector} ${attributes}></${selector}>`,
  });
};
