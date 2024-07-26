import name from "@primate/i18n/base/name";

export default ({ locale, env }) => async (request, next) => {
  if (!env.active) {
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
};
