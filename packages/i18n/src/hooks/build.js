import NoLocaleDirectory from "@primate/i18n/errors/no-locale-directory";
import NoDefaultLocale from "@primate/i18n/errors/no-default-locale";

export default ({ directory, locale }) => async (app, next) => {
  const root = app.root.join(directory);
  if (!await root.exists()) {
    NoLocaleDirectory.warn(app.log, root);
    return next(app);
  }

  const base = app.path.build.join(directory);
  await base.create();

  let has_default_locale = false;

  const json_re = /^.*.json$/u;
  await Promise.all((await root.collect(json_re)).map(async path => {
    const name = path.base;
    const code = `export default ${await path.text()}`;
    name === locale && (has_default_locale = true);
    await base.join(`${path.base}.js`).write(code);
  }));

  if (!has_default_locale) {
    NoDefaultLocale.warn(app.log, locale, root);
    return next(app);
  }

  app.server_build.push("locales");

  return next(app);
};
