import runtime from "handlebars/runtime.js";

export default (component, data) => runtime.template(component)(data);
