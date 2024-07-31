import { Component as component } from "@angular/core";
import selector from "./selector.js";

export default ({ template, imports }) => component({
  selector,
  imports,
  template,
  standalone: true,
})(class {});
