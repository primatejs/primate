import no_default_locale from "#error/no-default-locale";
import no_local_directory from "#error/no-locale-directory";
//import type { BuildAppHook } from "@primate/core/hook";

/*type Init = {
  directory: string;
  locale: string;
};*/

export default ({ directory, locale }/*: Init*/)/*: BuildAppHook*/ => async (app, next) => {
  const location = app.config("location");
  const root = app.root.join(directory);
  if (!await root.exists()) {
    no_local_directory(root);
    return next(app);
  }

  const base = app.path.build.join(location.server, directory);
  await base.create();

  let has_default_locale = false;

  const json_re = /^.*.json$/u;
  await Promise.all((await root.collect(json_re)).map(async path => {
    const name = path.base;
    const code = `export default ${await path.text()}`;
    name === locale && (has_default_locale = true);
    await base.join(`${path.base}.js`).write(code);
  }));

  if (!(has_default_locale/* as boolean*/)) {
    no_default_locale(locale, root);
    return next(app);
  }

  app.server_build.push("locales");

  return next(app);
};
