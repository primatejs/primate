import { Component as as_component, reflectComponentType } from "@angular/core";
import { selector } from "@primate/frontend/angular/common";
import * as O from "rcompat/object";

const double_to_single = string => string.replaceAll("\"", "'");

const root_component = ({ template, imports }) => as_component({
  selector,
  imports,
  template,
  standalone: true,
})(class {});

export default (real_root, props) => {
  const { selector } = reflectComponentType(real_root);
  const attributes = Object.entries(props)
    .map(([key, value]) => `[${key}]="${double_to_single(O.stringify(value))}"`)
    .join(" ");

  return root_component({
    imports: [real_root],
    template: `<${selector} ${attributes}></${selector}>`,
  });
};
