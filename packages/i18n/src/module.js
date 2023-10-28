import { bold } from "runtime-compat/colors";
import { from } from "runtime-compat/object";
import errors from "./errors.js";

const ending = -5;
const { MissingLocaleDirectory, EmptyLocaleDirectory } = errors;

const import_if_active = (app, module) =>
  app.modules.names.includes(`primate:${module}`) &&
    app.import("@primate/i18n", module);

export default ({
  // directory for stores
  directory = "locales",
  // default locale
  locale = "en",
} = {}) => {
  const module = "primate/i18n";
  const env = {};
  let active = false;

  return {
    name: "primate:i18n",
    async init(app, next) {
      const root = app.root.join(directory);
      if (!await root.exists) {
        MissingLocaleDirectory.warn(app.log, root);
        return next(app);
      }

      const locales = await Promise.all((await root.collect(/^.*.json$/u))
        .map(async path => {
          const depathed = `${path}`.replace(`${root}/`, () => "")
            .slice(0, ending);
          app.log.info(`loading ${bold(depathed)}`, { module });
          return [
            `${path}`.replace(`${root}/`, () => "").slice(0, ending),
            await path.file.json(),
          ];
        }));

      if (Object.keys(locales).length === 0) {
        EmptyLocaleDirectory.warn(app.log, root);
        return next(app);
      }

      app.log.info("all locales nominal", { module });

      env.locales = from(locales);

      active = true;

      return next(app);
    },
    async publish(app, next) {
      if (!active) {
        return next(app);
      }

      await import_if_active(app, "svelte");
      await import_if_active(app, "react");
      await import_if_active(app, "solid");

      return next(app);
    },
    async context(request, next) {
      if (!active) {
        return next(request);
      }

      const context = await next(request);

      const server_locales = Object.keys(env.locales);
      const client_locales = request.headers.get("accept-language")
        ?.split(";")[0]?.split(",") ?? [];

      const $locale = client_locales.find(client_locale =>
        server_locales.includes(client_locale)) ?? locale;

      return { ...context, i18n: { locale: $locale, locales: env.locales } };
    },
  };
};
