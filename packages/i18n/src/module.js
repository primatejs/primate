import errors from "./errors.js";
import { from } from "runtime-compat/object";

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
  const env = {};

  return {
    name: "primate:i18n",
    async init(app, next) {
      const root = app.root.join(directory);
      !await root.exists && MissingLocaleDirectory.throw(root);

      const locales = await Promise.all((await root.collect(/^.*.json$/u))
        .map(async path => [
          `${path}`.replace(`${root}/`, () => "").slice(0, ending),
          await path.file.json(),
        ]));

      Object.keys(locales).length === 0 && EmptyLocaleDirectory.throw(root);

      app.log.info("all locales nominal", { module: "primate/i18n" });

      env.locales = from(locales);

      return next(app);
    },
    async publish(app, next) {
      await import_if_active(app, "svelte");
      await import_if_active(app, "react");
      await import_if_active(app, "solid");

      return next(app);
    },
    async context(request, next) {
      const context = await next(request);

      return { ...context, i18n: { locale, locales: env.locales } };
    },
  };
};
