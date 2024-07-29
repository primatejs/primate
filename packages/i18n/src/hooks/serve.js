import name from "@primate/i18n/base/name";
import dim from "@rcompat/cli/color/dim";

const module = name;

export default ({ locale: default_locale, env }) => async (app, next) => {
  if (app.files.locales === undefined) {
    return next(app);
  }

  const loaded = [];

  const locales = Object.fromEntries(app.files.locales.map(([name, locale]) => {
    loaded.push(name);

    return [name, locale.default];
  }));

  app.log.info(`loaded ${loaded.map(l => dim(l)).join(" ")}`, { module });

  env.log = app.log;
  env.locales = locales;
  env.defaults = { locale: default_locale };
  env.active = true;

  return next({ ...app, locales });
};
