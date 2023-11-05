import { dim } from "rcompat/colors";
import { from } from "rcompat/object";
import { Response, Status } from "rcompat/http";
import errors from "./errors.js";

const ending = -5;
const {
  EmptyLocaleDirectory,
  MissingDefaultLocale,
  MissingLocaleDirectory,
} = errors;

const cookie = (name, value, { path, secure, httpOnly, sameSite }) =>
  `${name}=${value};${httpOnly};Path=${path};${secure};SameSite=${sameSite}`;

const import_if_active = (app, module) =>
  app.modules.names.includes(`primate:${module}`) &&
    app.import("@primate/i18n", module);
const name = "primate:i18n";

const disable = (condition, error) => {
  if (condition) {
    error();
    throw new Error();
  }
};

export default ({
  // directory for stores
  directory = "locales",
  // default locale
  locale = "en",
} = {}) => {
  const module = "primate/i18n";
  const env = {};
  let active = true;

  const options = {
    sameSite: "Strict" ,
    path: "/",
    httpOnly: "HttpOnly",
  };

  return {
    name,
    async init(app, next) {
      const root = app.root.join(directory);

      try {
        disable(!await root.exists(), () => {
          MissingLocaleDirectory.warn(app.log, root);
        });

        const loaded = [];
        const locales = from(await Promise.all((await root.collect(/^.*.json$/u))
          .map(async path => {
            const depathed = `${path}`.replace(`${root}/`, () => "")
              .slice(0, ending);
            loaded.push(depathed);
            return [
              `${path}`.replace(`${root}/`, () => "").slice(0, ending),
              await path.json(),
            ];
          })));

        app.log.info(`loading ${loaded.map(l => dim(l)).join(" ")}`, { module });

        disable(Object.keys(locales).length === 0, () => {
          EmptyLocaleDirectory.warn(app.log, root);
        });

        disable(locales[locale] === undefined, () => {
          MissingDefaultLocale.warn(app.log, locale, root);
        });

        app.log.info("all locales nominal", { module });

        env.locales = locales;
      } catch (_) {
        active = false;
        app.log.warn("module disabled", { module });
      }

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
    handle(request, next) {
      const set_locale = request.headers.get("primate-i18n-locale");

      if (set_locale === undefined) {
        return next(request);
      }

      return new Response("", {
        status: Status.OK,
        headers: {
          "Set-Cookie": cookie(name, set_locale, options),
        },
      });

    },
    async context(request, next) {
      if (!active) {
        return next(request);
      }

      const context = await next(request);

      const server_locales = Object.keys(env.locales);
      const client_locales = request.headers.get("accept-language")
        ?.split(";")[0]?.split(",") ?? [];

      const $locale = request.cookies.get(name)
        ?? client_locales.find(c_locale => server_locales.includes(c_locale))
        ?? locale;

      return { ...context, i18n: { locale: $locale, locales: env.locales } };
    },
  };
};
