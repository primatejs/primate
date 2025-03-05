import log from "#log";
import cascade from "@rcompat/async/cascade";
import { type ServeApp } from "#serve/app";

export default async (app: ServeApp) => {
  log.system("in startup");
  const $app = app.modules.serve === undefined
   ? app
   : await cascade(app.modules.serve)(app);
  await $app.start();
};
