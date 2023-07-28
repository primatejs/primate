import {select} from "./prompts.js";
import {staticServer, api, webApp} from "./templates/exports.js";

export default async () => (await select({
  message: "Choose template",
  options: [
    {value: webApp, label: "Web app"},
    {value: api, label: "API"},
    {value: staticServer, label: "Static server"},
  ],
}))();
