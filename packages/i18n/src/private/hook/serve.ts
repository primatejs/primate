import type Manager from "#Manager";
import s_manager from "#s_manager";
import type { ServeAppHook } from "@primate/core/hook";

export default (manager: Manager): ServeAppHook => async (app, next) => {
  if (app.files.locales === undefined) {
    return next(app);
  }

  manager.init(Object.fromEntries(app.files.locales.map(([name, locale]) =>
    [name, locale.default]
  )));

  app.set(s_manager, manager);

  return next(app);
};
