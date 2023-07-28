import root from "./root.js";
import template from "./template.js";

export default async () => [await root(), await template()];
