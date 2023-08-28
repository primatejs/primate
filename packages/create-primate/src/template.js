import {select} from "./prompts.js";
import {static_server, api, web_app} from "./templates/exports.js";

export default async () => (await select({
  message: "Choose template",
  options: [
    {value: web_app, label: "Web app"},
    {value: api, label: "API"},
    {value: static_server, label: "Static server"},
  ],
}))();
