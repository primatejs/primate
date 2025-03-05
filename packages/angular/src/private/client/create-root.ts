import root_selector from "#client/root-selector";
import { Component, reflectComponentType } from "@angular/core";
import type Props from "@primate/core/frontend/Props";
import type Dictionary from "@rcompat/record/Dictionary";
import stringify from "@rcompat/record/stringify";

type ComponentType = typeof Component;

const root_component = ({ template, imports }: Parameters<ComponentType>[0]) => Component({
  selector: root_selector,
  imports,
  template,
  standalone: true,
})(class {});

const double_to_single = (string: string) => string.replaceAll("\"", "'");

export default (component: ComponentType, props: Props) => {
  const { selector } = reflectComponentType(component)!;
  const attributes = Object.entries(props)
    .map(([key, value]) => `[${key}]="${double_to_single(stringify(value as Dictionary))}"`)
    .join(" ");

  return root_component({
    imports: [component],
    template: `<${selector} ${attributes}></${selector}>`,
  });
};
