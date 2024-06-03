import { dim } from "rcompat/colors";
import { Status } from "rcompat/http";
import * as O from "rcompat/object";
import errors from "./errors.js";

const {
  EmptyLocaleDirectory,
  MissingDefaultLocale,
  MissingLocaleDirectory,
} = errors;

const cookie = (name, value, { path, secure, httpOnly, sameSite }) =>
  `${name}=${value};${httpOnly};Path=${path};${secure};SameSite=${sameSite}`;

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
    async build(app, next) {
      await app.stage(app.root.join(directory), directory);

      return next(app);
    },
    async serve(app, next) {
      const root = app.runpath(directory);

      try {
        disable(!await root.exists(), () => {
          MissingLocaleDirectory.warn(app.log, root);
        });

        const loaded = [];
        const json_re = /^.*.json$/u;
        const locales = Object.fromEntries(await Promise.all((await root.collect(json_re))
          .map(async path => {
            const { base: depathed } = path.debase(root, "/");
            loaded.push(depathed);
            return [depathed, await path.json()];
          })));

        const loading = `loading ${loaded.map(l => dim(l)).join(" ")}`;
        app.log.info(loading, { module });

        disable(O.empty(locales), () => {
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
