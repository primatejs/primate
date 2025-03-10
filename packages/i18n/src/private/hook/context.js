import name from "#name";
//import type { RequestHook } from "@primate/core/hook";
//import type Dictionary from "@rcompat/record/Dictionary";

/*type Init = {
  locale: string;
  env: {
    active: boolean;
    locales: Dictionary,
  };
};*/

export default ({ locale, env }/*: Init*/)/*: RequestHook */=> async (request, next) => {
  if (!env.active) {
    return next(request);
  }

  const context = await next(request);

  const server_locales = Object.keys(env.locales);
  const client_locales = request.headers.get("accept-language")
    ?.split(";")[0]?.split(",") ?? [];

  const $locale = request.cookies[name]
    ?? client_locales.find(c_locale => server_locales.includes(c_locale))
    ?? locale;

  return { ...context, i18n: { locale: $locale, locales: env.locales } };
};
