import errors from "./errors.js";
import { from } from "runtime-compat/object";

const ending = -5;
const { MissingLocaleDirectory, EmptyLocaleDirectory } = errors;

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
      // TODO: check if those frontend frameworks are loaded (handler for
      // .svelte?)
      await app.import("@primate/i18n", "svelte");
      await app.import("@primate/i18n", "react");

      return next(app);
    },
    async context(request, next) {
      const context = await next(request);

      return { ...context, i18n: { locale, locales: env.locales } };
    },
  };
};
