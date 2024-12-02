import log from "#log";
import cascade from "@rcompat/async/cascade";
import { type App } from "#serve";

export default async (app: App) => {
  log.system("in startup");
  const $app = app.modules.serve === undefined
   ? app
   : await cascade(app.modules.serve)(app);
  await $app.start();
};
